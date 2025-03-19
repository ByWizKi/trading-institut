import EasyMDE from 'easymde';
import MarkdownIt from 'markdown-it';
import 'easymde/dist/easymde.min.css';

// Configuration du parser Markdown → HTML avec classes TailwindCSS
const mdParser = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

mdParser.renderer.rules.paragraph_open = () =>
	`<p class="mb-4 text-gray-800 leading-relaxed">`;
mdParser.renderer.rules.heading_open = (tokens, idx) => {
	const level = tokens[idx].tag;
	const classes =
		{
			h1: 'text-3xl font-bold mt-6 mb-4 text-gray-900',
			h2: 'text-2xl font-semibold mt-6 mb-3 text-gray-800',
			h3: 'text-xl font-semibold mt-4 mb-2 text-gray-700',
			h4: 'text-lg font-medium mt-4 mb-2 text-gray-600',
			h5: 'text-base font-medium mt-4 mb-2 text-gray-500',
			h6: 'text-sm font-medium mt-4 mb-2 text-gray-400',
		}[level] || '';
	return `<${level} class="${classes}">`;
};
mdParser.renderer.rules.image = (tokens, idx) => {
	const src = tokens[idx].attrs?.find(attr => attr[0] === 'src')?.[1] || '';
	const alt = tokens[idx].content || '';
	return `<img class="rounded-lg shadow-lg w-full my-6" src="${src}" alt="${alt}" />`;
};

// Initialisation de l'éditeur Markdown avec prévisualisation améliorée
const editor = new EasyMDE({
	element: document.getElementById('editor') as HTMLTextAreaElement,
	spellChecker: false,
	sideBySideFullscreen: false,
	previewRender: (markdown: string) => mdParser.render(markdown),
});

// Récupération des éléments HTML
const pushToGitButton = document.getElementById(
	'pushToGitButton'
) as HTMLButtonElement | null;
const imageUploadInput = document.getElementById(
	'imageUpload'
) as HTMLInputElement | null;
const confirmPushButton = document.getElementById(
	'confirmPushButton'
) as HTMLButtonElement | null;
const imageListContainer = document.getElementById(
	'imageListContainer'
) as HTMLDivElement | null;
const imageList = document.getElementById('imageList') as HTMLUListElement | null;

// Liste des images importées dans la session actuelle
const importedImages: { name: string; path: string; sha: string }[] = [];

// Liste des images locales pour la session actuelle
const localImages: { name: string; file: File }[] = [];

// Récupération des infos GitHub depuis `env.json`
const getGitHubConfig = async (): Promise<{
	GITHUB_REPO: string;
	GITHUB_BRANCH: string;
	GITHUB_IMAGE_FOLDER: string;
	GITHUB_FOLDER: string;
	GITHUB_TOKEN: string;
	GITHUB_USERNAME: string;
}> => {
	const response = await fetch('/env.json');
	return await response.json();
};

// Générer un nom de fichier unique avec date et heure
const generateFileName = (prefix: string, extension: string): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	return `${prefix}-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.${extension}`;
};

// ✅ Fonction pour supprimer une image de la liste des images importées
function removeImageFromSession(name: string): void {
	const index = importedImages.findIndex((image) => image.name === name);
	if (index !== -1) {
		importedImages.splice(index, 1);
		refreshImageList();
	}
}

// Fonction pour rafraîchir la liste des images affichées
function refreshImageList(): void {
	if (!imageList || !imageListContainer) return;

	imageList.innerHTML = ''; // Clear the list
	if (localImages.length === 0) {
		imageListContainer.classList.add('hidden');
		return;
	}

	imageListContainer.classList.remove('hidden');
	localImages.forEach((image) => {
		const listItem = document.createElement('li');
		listItem.className = 'flex items-center justify-between';

		const imageName = document.createElement('span');
		imageName.textContent = image.name;

		const deleteButton = document.createElement('button');
		deleteButton.textContent = '🗑️ Supprimer';
		deleteButton.className =
			'bg-red-600 text-white py-1 px-3 rounded-md font-semibold shadow-md hover:bg-red-700 transition';
		deleteButton.onclick = () => deleteLocalImage(image);

		listItem.appendChild(imageName);
		listItem.appendChild(deleteButton);
		imageList.appendChild(listItem);
	});
}

// Fonction pour supprimer une image de GitHub
async function deleteImageFromGitHub(image: {
	name: string;
	path: string;
	sha: string;
}): Promise<void> {
	const githubConfig = await getGitHubConfig();
	const repo = githubConfig.GITHUB_REPO;
	const token = githubConfig.GITHUB_TOKEN;

	try {
		const response = await fetch(
			`https://api.github.com/repos/${repo}/contents/${image.path}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `token ${token}`,
					Accept: 'application/vnd.github.v3+json',
				},
				body: JSON.stringify({
					message: `Suppression de l'image : ${image.name}`,
					sha: image.sha,
				}),
			}
		);

		if (response.ok) {
			alert(`✅ Image "${image.name}" supprimée avec succès.`);
			removeImageFromSession(image.name); // Remove from session list
		} else {
			alert("❌ Erreur lors de la suppression de l'image.");
		}
	} catch (error) {
		alert(`❌ Erreur réseau : ${error}`);
	}
}

//  Fonction pour uploader une image sur GitHub et retourner ses informations
async function uploadImageToGitHub(file: File): Promise<{
	name: string;
	path: string;
	sha: string;
} | null> {
	const githubConfig = await getGitHubConfig();
	const repo = githubConfig.GITHUB_REPO;
	const branch = githubConfig.GITHUB_BRANCH;
	const folder = githubConfig.GITHUB_IMAGE_FOLDER;
	const token = githubConfig.GITHUB_TOKEN;
	const username = githubConfig.GITHUB_USERNAME;

	// Vérification du fichier sélectionné
	const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
	const fileExtension = file.name.split('.').pop()?.toLowerCase();
	if (!fileExtension || !validExtensions.includes(fileExtension)) {
		alert('❌ Seuls les fichiers JPG, PNG ou GIF sont autorisés.');
		return null;
	}

	// Générer un nom unique
	const fileName = generateFileName('image', fileExtension);
	const path = `${folder}/${fileName}`;

	// Lire l'image en Base64
	const reader = new FileReader();
	reader.readAsDataURL(file);

	return new Promise((resolve) => {
		reader.onload = async () => {
			const base64Image = reader.result?.toString().split(',')[1];
			if (!base64Image) {
				alert('❌ Erreur lors de la lecture du fichier.');
				resolve(null);
				return;
			}

			// Préparer la requête GitHub
			const payload = {
				message: `Ajout automatique d'image : ${fileName}`,
				content: base64Image,
				branch: branch,
				committer: { name: username, email: 'noreply@github.com' },
			};

			// Envoi de l'image
			try {
				const response = await fetch(
					`https://api.github.com/repos/${repo}/contents/${path}`,
					{
						method: 'PUT',
						headers: {
							Authorization: `token ${token}`,
							Accept: 'application/vnd.github.v3+json',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
					}
				);

				const result = await response.json();
				if (response.ok) {
					alert(`✅ Image "${fileName}" uploadée avec succès.`);
					resolve({ name: fileName, path, sha: result.content.sha });
				} else {
					alert(`❌ Erreur GitHub : ${result.message}`);
					resolve(null);
				}
			} catch (error) {
				alert(`❌ Erreur réseau : ${error}`);
				resolve(null);
			}
		};
	});
}

// ✅ Gestion de l'upload d'une image unique
imageUploadInput?.addEventListener('change', async (event) => {
	const files = (event.target as HTMLInputElement).files;
	if (!files || files.length === 0) return;

	for (const file of Array.from(files)) {
		// Upload the image to GitHub
		const uploadedImage = await uploadImageToGitHub(file);
		if (uploadedImage) {
			// Add the image to the local list
			localImages.push({ name: uploadedImage.name, file });
			importedImages.push(uploadedImage); // Add to imported images for GitHub tracking
			refreshImageList();

			// 📌 Intégrer l'image dans l'éditeur Markdown avec le chemin GitHub
			const githubConfig = await getGitHubConfig();
			const imageUrl = `https://raw.githubusercontent.com/${githubConfig.GITHUB_REPO}/${githubConfig.GITHUB_BRANCH}/${uploadedImage.path}`;
			const imageMarkdown = `![${uploadedImage.name}](${imageUrl})`;
			editor.codemirror.replaceSelection(imageMarkdown + '\n');
		}
	}
});

// ✅ Fonction pour supprimer une image locale et sur GitHub
async function deleteLocalImage(image: { name: string; file: File }): Promise<void> {
	if (confirm(`Êtes-vous sûr de vouloir supprimer l'image "${image.name}" ?`)) {
		const index = localImages.findIndex((img) => img.name === image.name);
		if (index !== -1) {
			const githubImage = importedImages.find((img) => img.name === image.name);
			if (githubImage) {
				deleteImageFromGitHub(githubImage).then(async () => {
					// Supprimer l'image de la liste locale après suppression sur GitHub
					localImages.splice(index, 1);
					refreshImageList();

					// 📌 Supprimer l'image du contenu de l'éditeur Markdown
					const githubConfig = await getGitHubConfig();
					const imageUrl = `https://raw.githubusercontent.com/${githubConfig.GITHUB_REPO}/${githubConfig.GITHUB_BRANCH}/${githubImage.path}`;
					const content = editor.value();
					const updatedContent = content.replace(
						new RegExp(`!\\[${githubImage.name}\\]\\(${imageUrl}\\)\\n?`, 'g'),
						''
					);
					editor.value(updatedContent);
				});
			} else {
				// Si l'image n'est pas sur GitHub, supprimer uniquement de la liste locale
				localImages.splice(index, 1);
				refreshImageList();
			}
		}
	}
}

// ✅ Fonction pour envoyer un article Markdown sur GitHub
async function pushMarkdownToGitHub(): Promise<void> {
	// Masquer le bouton de confirmation au début
	confirmPushButton?.classList.add('hidden');

	const content = editor.value();
	if (!content.trim()) {
		alert('❌ Veuillez écrire du contenu avant de push.');
		return;
	}

	// Afficher le bouton de confirmation
	confirmPushButton?.classList.remove('hidden');

	// Attendre la confirmation de l'utilisateur
	confirmPushButton!.onclick = async () => {
		const fileName = generateFileName('article', 'md');
		const githubConfig = await getGitHubConfig();
		const repo = githubConfig.GITHUB_REPO;
		const branch = githubConfig.GITHUB_BRANCH;
		const folder = githubConfig.GITHUB_FOLDER;
		const token = githubConfig.GITHUB_TOKEN;
		const username = githubConfig.GITHUB_USERNAME;
		const path = `${folder}/${fileName}`;

		// 📌 Encodage du contenu en Base64
		const base64Content = btoa(unescape(encodeURIComponent(content)));

		// 📌 Envoi du fichier Markdown
		const payload = {
			message: `Ajout automatique : ${fileName}`,
			content: base64Content,
			branch: branch,
			committer: { name: username, email: 'noreply@github.com' },
		};

		try {
			const response = await fetch(
				`https://api.github.com/repos/${repo}/contents/${path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			);
			if (response.ok) alert(`✅ Fichier pushé : ${fileName}`);
			else alert('❌ Erreur lors du push GitHub');
		} catch (error) {
			alert(`❌ Erreur réseau : ${error}`);
		}

		// Masquer le bouton de confirmation après l'envoi
		confirmPushButton?.classList.add('hidden');
	};
}

// ✅ Ajout des événements
pushToGitButton?.addEventListener('click', pushMarkdownToGitHub);

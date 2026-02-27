import { execSync } from 'child_process';

console.log("🚀 Démarrage du build NPM...");

try {
    console.log("🧹 Nettoyage du dossier lib...");
    execSync('rimraf lib', { stdio: 'inherit' });

    console.log("🔨 Compilation avec Babel...");

    const ignorePatterns = [
        "**/pages",
        "**/assets",
        "**/main.jsx",
        "**/App.jsx",
        "**/App.css",
        "**/index.css"
    ].join(",");

    execSync(`npx babel src --out-dir lib --copy-files --no-copy-ignored --ignore "${ignorePatterns}"`, { stdio: 'inherit' });

    console.log("✨ Nettoyage final des résidus...");
    execSync('rimraf lib/App.css lib/index.css lib/pages lib/assets', { stdio: 'inherit' });

    console.log("✅ Build NPM terminé avec succès !");
} catch (error) {
    console.error("❌ Erreur lors du build :", error.message);
    process.exit(1);
}
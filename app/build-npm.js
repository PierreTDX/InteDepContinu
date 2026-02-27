import { execSync } from 'child_process';

console.log("🚀 Démarrage du build NPM...");

try {
    // 1. Nettoyage du dossier de destination
    console.log("🧹 Nettoyage du dossier lib...");
    execSync('rimraf lib', { stdio: 'inherit' });

    // 2. Compilation avec Babel
    console.log("🔨 Compilation avec Babel...");
    // Liste des fichiers/dossiers à ignorer
    const ignorePatterns = [
        "**/pages",
        "**/assets",
        "**/main.jsx",
        "**/App.jsx",
        "**/App.css",
        "**/index.css",
        "**/*.test.js",
        "**/*.spec.js",
        "**/vite-env.d.ts"
    ].join(",");

    execSync(`npx babel src --out-dir lib --copy-files --no-copy-ignored --ignore "${ignorePatterns}"`, { stdio: 'inherit' });

    // 3. Nettoyage post-compilation (fichiers copiés par erreur par --copy-files)
    console.log("✨ Nettoyage final des résidus...");
    execSync('rimraf lib/App.css lib/index.css lib/pages lib/assets', { stdio: 'inherit' });

    console.log("✅ Build NPM terminé avec succès !");
} catch (error) {
    console.error("❌ Erreur lors du build :", error.message);
    process.exit(1);
}
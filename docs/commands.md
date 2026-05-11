# Commandes nAIxus

Toutes les commandes supposent que le projet est buildé :

```bash
pnpm run build
node dist/cli.js <commande>
```

En développement, vous pouvez aussi utiliser :

```bash
pnpm run dev -- <commande>
```

## Utilisation sans installation locale

Le package expose le binaire `naixus`. Une fois publié, il peut être exécuté sans installation globale :

```bash
pnpm dlx naixus <commande>
npx naixus <commande>
```

Exemple :

```bash
pnpm dlx naixus install --target pi
```

Depuis GitHub, le CLI peut aussi être exécuté sans build local grâce au dossier `dist/` versionné :

```bash
pnpm dlx github:Florian-Piault/nAIxus <commande>
pnpm dlx https://github.com/Florian-Piault/nAIxus.git <commande>
```

## Mode interactif

```bash
node dist/cli.js
```

```bash
pnpm dlx github:Florian-Piault/nAIxus
npx github:Florian-Piault/nAIxus
```

Lance un assistant qui demande la commande, la cible, le mode si nécessaire, puis propose une sélection des ressources pour `install` et `sync`.

## `install`

```bash
node dist/cli.js install --target pi --mode copy
```

Installe les ressources vers les dossiers natifs de la cible.

Options principales :

- `--target <target>` : cible obligatoire (`pi`, `claude`, `codex`).
- `--mode <mode>` : `copy` ou `link`. Par défaut en CLI : `link`.
- `--dry-run` : affiche les écritures prévues sans modifier le système.
- `--force` : écrase les destinations conflictuelles.
- `--include <id...>` : installe uniquement les ressources listées.
- `--exclude <id...>` : retire des ressources de la sélection.

Sans `--include` ni `--exclude`, `install` installe toutes les ressources disponibles.

Exemples :

```bash
node dist/cli.js install --target pi --include core/skills/code-review core/prompts/example
node dist/cli.js install --target claude --exclude core/skills/commit
```

Quand une sélection est fournie, elle est enregistrée dans le manifeste de la cible via `selectedResources`.

## `sync`

```bash
node dist/cli.js sync --target pi --mode link
```

Réapplique l'installation. Utile après modification de `core/` ou `harness/`.

Options principales :

- `--target <target>` : cible obligatoire (`pi`, `claude`, `codex`).
- `--mode <mode>` : `copy` ou `link`. Par défaut en CLI : `link`.
- `--dry-run` : affiche les écritures prévues sans modifier le système.
- `--force` : écrase les destinations conflictuelles.
- `--include <id...>` : synchronise uniquement les ressources listées.
- `--exclude <id...>` : retire des ressources de la sélection.

Si le manifeste contient `selectedResources` et qu'aucune nouvelle sélection n'est fournie, `sync` réutilise la sélection persistée.

## `list-resources`

```bash
node dist/cli.js list-resources --target pi
```

Liste les IDs utilisables avec `--include` et `--exclude`.

Options :

- `--target <target>` : cible obligatoire (`pi`, `claude`, `codex`).
- `--verbose` : affiche aussi les chemins source/destination et le statut manifeste.
- `--json` : affiche une sortie JSON pour les scripts.

Exemples :

```bash
node dist/cli.js list-resources --target pi
node dist/cli.js list-resources --target pi --verbose
node dist/cli.js list-resources --target pi --json
```

Les IDs sont des chemins relatifs POSIX, par exemple :

```text
core/skills/code-review
core/prompts/example
harness/pi/config-file
```

## `uninstall`

```bash
node dist/cli.js uninstall --target pi
```

Supprime uniquement les ressources gérées listées dans le manifeste de la cible. Les ressources modifiées depuis l'installation sont ignorées pour éviter de supprimer du contenu utilisateur.

Options :

- `--target <target>` : cible à désinstaller.
- `--all` : désinstalle toutes les cibles.
- `--dry-run` : affiche les suppressions prévues sans modifier le système.

## `doctor`

```bash
node dist/cli.js doctor --target pi
```

Affiche les chemins attendus, l'état du manifeste et indique si les ressources gérées existent encore ou ont été modifiées.

Options :

- `--target <target>` : cible à vérifier.
- `--all` : vérifie toutes les cibles.

## `paths`

```bash
node dist/cli.js paths --target pi
```

Affiche les dossiers natifs résolus pour une cible et les racines de ressources installables.

Options :

- `--target <target>` : cible à inspecter.
- `--all` : affiche les chemins de toutes les cibles.

## `targets`

```bash
node dist/cli.js targets
```

Liste les cibles supportées.

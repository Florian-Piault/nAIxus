# nAIxus

nAIxus est un petit CLI pour partager et installer un même setup d'agents entre plusieurs harness : Pi, Claude et Codex.

Il copie ou lie les ressources du dépôt vers les dossiers natifs de chaque outil :

- `core/skills` → skills de la cible
- `core/prompts` → prompts ou commandes de la cible
- `core/context` → contexte partagé
- `harness/<target>` → configuration spécifique à une cible

## Prérequis

- Node.js 20+
- pnpm

## Installation

```bash
pnpm install
pnpm run build
```

En développement, il est aussi possible d'utiliser :

```bash
pnpm run dev
```

## Commandes

### Mode interactif

```bash
pnpm run start
```

Lance un assistant qui demande la commande, la cible et le mode si nécessaire.

### Installer

```bash
node dist/cli.js install --target pi --mode copy
```

Installe les ressources pour une cible. `--target` accepte `pi`, `claude` ou `codex`.

### Synchroniser

```bash
node dist/cli.js sync --target pi --mode link
```

Réapplique l'installation. Utile après modification de `core/` ou `harness/`.

### Vérifier

```bash
node dist/cli.js doctor --target pi
```

Affiche les chemins attendus et indique s'ils existent.

## Modes

- `copy` : copie les fichiers. Plus portable.
- `link` : crée des liens symboliques. Pratique pour développer, mais peut demander des droits spécifiques sur Windows.

## Structure du projet

- `src/` : code du CLI
- `core/` : ressources communes
- `harness/` : ressources propres à chaque cible
- `dist/` : sortie de build TypeScript

## Contribuer

1. Créer une branche dédiée.
2. Modifier le minimum nécessaire.
3. Lancer `pnpm run build` avant de proposer le changement.
4. Documenter brièvement les nouvelles commandes ou dossiers dans ce README si besoin.

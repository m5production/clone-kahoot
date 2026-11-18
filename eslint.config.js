import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"

// Feature-Sliced Design: layers from top to bottom, see .devin/rules/fsd-architecture.md
const FSD_LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"]

const PUBLIC_API_PATTERNS = [
  {
    group: [
      "@/pages/*/*",
      "@/widgets/*/*",
      "@/features/*/*/*",
      "@/entities/*/*",
      "@/shared/*/*",
    ],
    message: "Import a slice through its public API (index.ts).",
  },
  {
    group: ["../*"],
    message: "Use the @/ alias to import from another slice.",
  },
]

const fsdLayerRules = (layer, { allowSameLayer }) => {
  const layerIndex = FSD_LAYERS.indexOf(layer)
  const forbiddenLayers = FSD_LAYERS.slice(
    0,
    allowSameLayer ? layerIndex : layerIndex + 1
  )

  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...PUBLIC_API_PATTERNS,
            ...(forbiddenLayers.length
              ? [
                  {
                    group: forbiddenLayers.map((name) => `@/${name}/**`),
                    message: `FSD: "${layer}" may import only from the layers below it.`,
                  },
                ]
              : []),
          ],
        },
      ],
    },
  }
}

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  fsdLayerRules("pages", { allowSameLayer: false }),
  fsdLayerRules("widgets", { allowSameLayer: false }),
  fsdLayerRules("features", { allowSameLayer: false }),
  // Entities may cross-import each other one way, marked `// FSD: cross import`
  fsdLayerRules("entities", { allowSameLayer: true }),
  fsdLayerRules("shared", { allowSameLayer: true }),
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: PUBLIC_API_PATTERNS }],
    },
  }
)

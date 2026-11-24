import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
    {
        ignores: [
            "dist/**",
            "generated/**",
            "node_modules/**",
            "coverage/**",
            "logs/**",
        ],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ["**/*.ts"],

        languageOptions: {
            globals: {
                ...globals.node,
            },
        },

        rules: {
            "@typescript-eslint/no-explicit-any": "error",

            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],

            "@typescript-eslint/no-require-imports": "error",

            "no-console": "off",
        },
    },
];
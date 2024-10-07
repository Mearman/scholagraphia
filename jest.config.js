// module.exports = {
// 	testEnvironment: "jsdom",
// 	moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
// 	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
// 	transform: {
// 		"^.+\\.tsx?$": "ts-jest",
// 	},
// };

export default {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: [
		// "<rootDir>/**/*.test.ts",
		// "<rootDir>/**/*.test.tsx"
		"<rootDir>/**/*.test.{ts,tsx}",
	],
	testPathIgnorePatterns: ["/node_modules/"],
	coverageDirectory: "./coverage",
	coveragePathIgnorePatterns: ["node_modules"],
	// reporters: ["default", "jest-junit"],
	// globals: { "ts-jest": { diagnostics: false } },
	transform: {},
};

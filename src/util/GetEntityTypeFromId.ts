export function getEntityTypeFromId(id: string): string {
	const prefix = id.split("/").pop()?.charAt(0);
	switch (prefix) {
		case "W":
			return "Work";
		case "C":
			return "Concept";
		case "A":
			return "Author";
		case "I":
			return "Institution";
		case "S":
			return "Source";
		default:
			return "Unknown";
	}
}

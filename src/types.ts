import { ReactNode } from "react";

const EntityType = {
	work: "work",
	author: "author",
	institution: "institution",
	concept: "concept",
	source: "source",
	topic: "topic",
	funder: "funder",
	// country: "country",
	// license: "license",
	// unknown: "unknown",
} as const;
type EntityType = (typeof EntityType)[keyof typeof EntityType];

const EntityEndpointPath: Record<EntityType, string> = {
	work: "works",
	author: "authors",
	institution: "institutions",
	concept: "concepts",
	source: "sources",
	topic: "topics",
	funder: "funders",
	// country: "countries",
	// license: "licenses",
	// unknown: "unknown",
} as const;

type EntityEndpointPath =
	(typeof EntityEndpointPath)[keyof typeof EntityEndpointPath];

const EntityCharacter: Record<EntityType, string> = {
	work: "w",
	author: "a",
	institution: "i",
	concept: "c",
	source: "s",
	topic: "t",
	funder: "f",
	// country: "",
	// license: "",
	// unknown: "",
} as const;

type EntityCharacter = (typeof EntityCharacter)[keyof typeof EntityCharacter];

export type EntityMetadata = {
	ENTITY_TYPE: EntityType;
	ENTITY_ENDPOINT: EntityEndpointPath;
	TYPE_CHAR: string;
};

export const entityTypeMappings: EntityMetadata[] = Object.entries(
	EntityType
).map(
	([, value]: [string, EntityType]): {
		ENTITY_TYPE: EntityType;
		ENTITY_ENDPOINT: EntityEndpointPath;
		TYPE_CHAR: EntityCharacter;
	} => ({
		ENTITY_TYPE: value,
		ENTITY_ENDPOINT: EntityEndpointPath[value]!,
		TYPE_CHAR: EntityCharacter[value]!,
	})
);

export { EntityCharacter, EntityEndpointPath, EntityType };

export interface Entity {
	id: string;
	display_name: string;
	type: EntityType | "unknown";
}

export interface SearchResult {
	id: string;
	display_name: string;
	entity_type: EntityType | "unknown";
}

export interface RelatedNode {
	id: string;
	display_name: string;
	type: EntityType | "unknown";
}

export function isCollectedEntity(
	something: unknown
): something is CollectedEntity {
	return (something as CollectedEntity).related_nodes !== undefined;
}
export function isCollection(something: unknown): something is Collection {
	return (something as Collection).id !== undefined;
}

export interface CollectedEntity extends Entity {
	related_nodes: RelatedNode[];
}

export interface Collection {
	id: string;
	name: string;
	entities: CollectedEntity[];
}

export type ThemeMode = "light" | "dark" | "auto";

export interface AppContextType {
	searchResults: SearchResult[];
	setSearchResults: (results: SearchResult[]) => void;
	collections: Collection[];
	activeCollectionId: string;
	setActiveCollectionId: (id: string) => void;
	selectedEntity: Entity | null;
	setSelectedEntity: (entity: Entity | null) => void;
	exportCollections: () => void;
	importAndMergeCollections: (importedCollections: Collection[]) => void;
	importAndReplaceCollections: (importedCollections: Collection[]) => void;
	clearAllCollections: () => void;
	createNewCollection: () => void;
	mergeCollections: (collectionIds: string[]) => void;
	cloneCollection: (collectionId: string) => void;
	splitCollection: (collectionId: string, entityIds: string[]) => void;
	themeMode: ThemeMode;
	cycleTheme: () => void;
	searchWhileTyping: boolean;
	toggleSearchWhileTyping: () => void;
	collectedEntities: CollectedEntity[];
	setCollectedEntities: (entities: CollectedEntity[]) => void;
	setCollections: (collections: Collection[]) => void;
}

export interface AppProviderProps {
	children: ReactNode;
}

export interface Meta {
	count: number;
	db_response_time_ms: number;
	page: number;
	per_page: number;
	groups_count?: number | null;
}

export interface Ids {
	openalex?: string;
	doi?: string;
	mag?: string;
	pmid?: string;
	orcid?: string;
	wikidata?: string;
	ror?: string;
	grid?: string;
	wikipedia?: string;
	iso?: string;
	crossref?: string;
}

export interface CountsByYear {
	year: number;
	works_count?: number;
	cited_by_count?: number;
}

export interface Subfield {
	id: string;
	display_name: string;
}

export interface Field {
	id: string;
	display_name: string;
}

export interface Domain {
	id: string;
	display_name: string;
}

export interface TopicItem {
	id: string;
	display_name: string;
	score?: number;
	count?: number;
	subfield: Subfield;
	field: Field;
	domain: Domain;
}

export interface Concept {
	id: string;
	wikidata: string;
	display_name: string;
	level: number;
	score: number;
}

export interface KeywordItem {
	id: string;
	display_name: string;
	score: number;
}

export interface Affiliation {
	raw_affiliation_string: string;
	institution_ids: string[];
}

export interface InstitutionItem {
	id: string;
	display_name: string;
	ror?: string;
	country_code?: string;
	type?: string;
	lineage?: string[];
}

export interface AuthorshipAuthor {
	id: string;
	display_name: string;
	orcid?: string | null;
}

export interface Authorship {
	author_position: string;
	author: AuthorshipAuthor;
	institutions: InstitutionItem[];
	countries: string[];
	is_corresponding: boolean;
	raw_author_name: string;
	raw_affiliation_strings: string[];
	affiliations: Affiliation[];
}

export interface OpenAccess {
	is_oa: boolean;
	oa_status?: string;
	oa_url?: string;
	any_repository_has_fulltext?: boolean;
}

export interface SourceItem {
	id: string;
	display_name: string;
	issn_l?: string;
	issn?: string[];
	is_oa?: boolean;
	is_in_doaj?: boolean;
	is_core?: boolean;
	host_organization?: string;
	host_organization_name?: string;
	host_organization_lineage?: string[];
	host_organization_lineage_names?: string[];
	type?: string;
}

export interface Location {
	is_oa: boolean;
	landing_page_url: string;
	pdf_url?: string | null;
	source?: SourceItem | null;
	license?: string | null;
	license_id?: string | null;
	version?: string | null;
	is_accepted: boolean;
	is_published: boolean;
}

export interface CitationNormalizedPercentile {
	value: number;
	is_in_top_1_percent: boolean;
	is_in_top_10_percent: boolean;
}

export interface CitedByPercentileYear {
	min: number;
	max: number;
}

export interface Biblio {
	volume: string;
	issue: string;
	first_page: string;
	last_page: string;
}

export interface SustainableDevelopmentGoal {
	id: string;
	score: number;
	display_name: string;
}

export interface SummaryStats {
	"2yr_mean_citedness": number;
	h_index: number;
	i10_index: number;
}

export interface Role {
	role: string;
	id: string;
	works_count: number;
}

export interface GroupBy {
	key: string;
	key_display_name: string;
	count: number;
}

// Generic API Result Interface
export interface APIResult<T> {
	meta: Meta;
	results: ApiResult<T>[];
	group_by: GroupBy[];
}

type ApiSearchResult<T> = T & { relevance_score: number };
type ApiResult<T> = T & { relevance_score?: number };

export interface Apc {
	value: number;
	currency: string;
	value_usd: number;
	provenance: string;
}

export interface InstitutionAssertion {
	// Define properties based on expected data
}

export interface MeshTerm {
	id: string;
	descriptor_ui: string;
	display_name: string;
	qualifier_ui?: string;
}

export interface Grant {
	id: string;
	funder: Funder;
	award_amount?: number;
	currency?: string;
}

export interface Dataset {
	id: string;
	title: string;
}

export interface Version {
	id: string;
	version_number: string;
}

export interface Work {
	id: string;
	doi?: string;
	title: string;
	display_name: string;
	publication_year: number;
	publication_date: string;
	ids: Ids;
	language?: string;
	primary_location: Location;
	type: string;
	type_crossref?: string;
	indexed_in?: string[];
	open_access: OpenAccess;
	authorships: Authorship[];
	institution_assertions?: InstitutionAssertion[];
	countries_distinct_count?: number;
	institutions_distinct_count?: number;
	corresponding_author_ids?: string[];
	corresponding_institution_ids?: string[];
	apc_list?: Apc;
	apc_paid?: Apc;
	fwci?: number;
	has_fulltext: boolean;
	fulltext_origin?: string;
	cited_by_count: number;
	citation_normalized_percentile?: CitationNormalizedPercentile;
	cited_by_percentile_year?: CitedByPercentileYear;
	biblio?: Biblio;
	is_retracted?: boolean;
	is_paratext?: boolean;
	primary_topic?: TopicItem;
	topics?: TopicItem[];
	keywords?: KeywordItem[];
	concepts?: Concept[];
	mesh?: MeshTerm[];
	locations_count?: number;
	locations?: Location[];
	best_oa_location?: Location;
	sustainable_development_goals?: SustainableDevelopmentGoal[];
	grants?: Grant[];
	datasets?: Dataset[];
	versions?: Version[];
	referenced_works_count?: number;
	referenced_works?: string[];
	related_works?: string[];
	cited_by_api_url: string;
	counts_by_year?: CountsByYear[];
	updated_date: string;
	created_date: string;
	abstract_inverted_index?: Record<string, number[]>;
}

// Author Result Interface
export interface AffiliationDetails {
	institution: InstitutionItem;
	years: number[];
}

export interface TopicShare {
	id: string;
	display_name: string;
	value: number;
	subfield: Subfield;
	field: Field;
	domain: Domain;
}

export interface Author {
	id: string;
	orcid?: string | null;
	display_name: string;
	display_name_alternatives: string[];
	works_count: number;
	cited_by_count: number;
	summary_stats: SummaryStats;
	ids: Ids;
	affiliations: AffiliationDetails[];
	last_known_institutions: InstitutionItem[];
	topics: TopicItem[];
	topic_share: TopicShare[];
	x_concepts: Concept[];
	counts_by_year: CountsByYear[];
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// Source Result Interface
export interface Source {
	id: string;
	issn_l?: string | null;
	issn?: string[] | null;
	display_name: string;
	host_organization: string;
	host_organization_name: string;
	host_organization_lineage: string[];
	works_count: number;
	cited_by_count: number;
	summary_stats: SummaryStats;
	is_oa: boolean;
	is_in_doaj: boolean;
	is_core: boolean;
	ids: Ids;
	homepage_url?: string;
	apc_prices?: Apc[] | null;
	apc_usd?: number | null;
	country_code: string;
	societies?: string[];
	alternate_titles?: string[];
	abbreviated_title?: string | null;
	type: string;
	topics?: TopicItem[];
	topic_share?: TopicShare[];
	x_concepts?: Concept[];
	counts_by_year: CountsByYear[];
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// Institution Result Interface
export interface Repository {
	id: string;
	display_name: string;
	host_organization: string;
	host_organization_name: string;
	host_organization_lineage: string[];
}

export interface Geo {
	city: string;
	geonames_city_id: string;
	region?: string | null;
	country_code: string;
	country: string;
	latitude: number;
	longitude: number;
}

export interface International {
	display_name: { [languageCode: string]: string };
}

export interface AssociatedInstitution {
	id: string;
	ror: string;
	display_name: string;
	country_code: string;
	type: string;
	relationship: string;
}

export interface Institution {
	id: string;
	ror: string;
	display_name: string;
	country_code: string;
	type: string;
	type_id: string;
	lineage: string[];
	homepage_url?: string;
	image_url?: string;
	image_thumbnail_url?: string;
	display_name_acronyms?: string[];
	display_name_alternatives?: string[];
	repositories?: Repository[];
	works_count: number;
	cited_by_count: number;
	summary_stats: SummaryStats;
	ids: Ids;
	geo?: Geo;
	international?: International;
	associated_institutions?: AssociatedInstitution[];
	counts_by_year: CountsByYear[];
	roles?: Role[];
	topics?: TopicItem[];
	topic_share?: TopicShare[];
	x_concepts?: Concept[];
	is_super_system?: boolean;
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// Topic Result Interface
export interface Sibling {
	id: string;
	display_name: string;
}

export interface Topic {
	id: string;
	display_name: string;
	description: string;
	keywords: string[];
	ids: Ids;
	subfield: Subfield;
	field: Field;
	domain: Domain;
	siblings: Sibling[];
	works_count: number;
	cited_by_count: number;
	updated_date: string;
	created_date: string;
}

// Keyword Result Interface
export interface Keyword {
	id: string;
	display_name: string;
	works_count: number;
	cited_by_count: number;
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// Publisher Result Interface
export interface Publisher {
	id: string;
	display_name: string;
	alternate_titles?: string[];
	hierarchy_level: number;
	parent_publisher?: string | null;
	lineage?: string[];
	country_codes?: string[];
	homepage_url?: string;
	image_url?: string;
	image_thumbnail_url?: string;
	works_count: number;
	cited_by_count: number;
	summary_stats: SummaryStats;
	ids: Ids;
	counts_by_year: CountsByYear[];
	roles?: Role[];
	sources_api_url: string;
	updated_date: string;
	created_date: string;
}

// Funder Result Interface
export interface Funder {
	id: string;
	display_name: string;
	alternate_titles?: string[];
	country_code?: string;
	description?: string;
	homepage_url?: string;
	image_url?: string;
	image_thumbnail_url?: string;
	grants_count: number;
	works_count: number;
	cited_by_count: number;
	summary_stats: SummaryStats;
	ids: Ids;
	counts_by_year: CountsByYear[];
	roles?: Role[];
	updated_date: string;
	created_date: string;
}

// Country Result Interface
export interface Continent {
	id: string;
	display_name: string;
}

export interface Country {
	id: string;
	display_name: string;
	country_code: string;
	description?: string;
	ids: Ids;
	display_name_alternatives?: string[];
	continent: Continent;
	is_global_south: boolean;
	works_count: number;
	cited_by_count: number;
	authors_api_url: string;
	institutions_api_url: string;
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// License Result Interface
export interface License {
	id: string;
	display_name: string;
	url: string;
	description?: string;
	works_count: number;
	cited_by_count: number;
	works_api_url: string;
	updated_date: string;
	created_date: string;
}

// Autocomplete Result Interface
export interface AutocompleteResult {
	id: string;
	short_id: string;
	display_name: string;
	hint: string;
	cited_by_count: number;
	works_count?: number;
	entity_type: string;
	external_id: string;
	filter_key: string;
}

export interface AutocompleteAPIResult {
	meta: Meta;
	results: AutocompleteResult[];
}

// Works Grouped By Type Interface
export interface GroupedResults {
	meta: Meta;
	group_by: GroupBy[];
}

export interface ApiSearchResults<T> {
	meta: Meta;
	results: ApiSearchResult<T>[];
	group_by: GroupBy[];
}

// Specialized Types for API Results
export type Licenses = ApiSearchResults<License>;
export type Countries = ApiSearchResults<Country>;
export type Funders = ApiSearchResults<Funder>;
export type Publishers = ApiSearchResults<Publisher>;
export type Topics = ApiSearchResults<Topic>;
export type Keywords = ApiSearchResults<Keyword>;
export type Sources = ApiSearchResults<Source>;
export type Institutions = ApiSearchResults<Institution>;
export type Works = ApiSearchResults<Work>;
export type Authors = ApiSearchResults<Author>;

export type AnyEntity =
	| Work
	| Author
	| Source
	| Institution
	| Topic
	| Keyword
	| Publisher
	| Funder
	| Country
	| License;

export type EntitySearchResults = ApiSearchResults<AnyEntity>;

export type Topic = {
  id: string
  name: string;
  priority: number;
  revisions: number;
  lastRevision: string;
  added: string;
};

export type Subject = {
  name: string;
  topics: Topic[];
}[];
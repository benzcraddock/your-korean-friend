import type { Persona } from '../types';
import { minji } from './minji';

export const personas: Record<string, Persona> = {
  [minji.id]: minji,
};

export const defaultPersonaId = minji.id;

export function getPersona(id: string = defaultPersonaId): Persona {
  return personas[id] ?? personas[defaultPersonaId];
}

export function listPersonas(): Persona[] {
  return Object.values(personas);
}

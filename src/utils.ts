/**
 * Get a template element from the document by ID
 *
 * @param id the ID of the template element
 * @returns the template element
 * @throws an error if the element is not found
 * @throws an error if the element is not an HTMLTemplateElement
 */
export function getTemplate(id: string): HTMLTemplateElement {
  const template = document.querySelector(id);
  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Error: ${id} is not a template`);
  }
  return template;
}

/**
 * Utility function to create a spacing string of a specified length.
 * @param spacing The number of spaces to generate.
 * @param spacer The character to use for spacing. DFaults to a space character.
 * @returns A string of spaces.
 */
export function generateSpacerString(spacing: number, spacer = " "): string {
  return spacer.repeat(spacing);
}

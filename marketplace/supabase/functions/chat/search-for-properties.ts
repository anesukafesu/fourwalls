import { tool } from "npm:@langchain/core/tools";
import { z } from "npm:zod";
import { createSupabaseClient } from "./create-supabase-client.ts";

interface PropertyFilter {
  maxPrice?: number;
  minPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  status?: string;
  neighbourhood?: string;
}

/**
 * Retrieves a list of properties from the database based on the provided filters.
 *
 * This function queries the "properties" table and applies filters such as city, status,
 * property type, number of bedrooms, number of bathrooms, and price range.
 *
 * @param filters - An object containing the following optional filter fields:
 *   - neighbourhood: string - The city where the property is located.
 *   - status: string - The status of the property (e.g., "available", "sold").
 *   - propertyType: string - The type of property (e.g., "apartment", "house").
 *   - bedrooms: number - The minimum number of bedrooms.
 *   - bathrooms: number - The minimum number of bathrooms.
 *   - minPrice: number - The minimum price of the property.
 *   - maxPrice: number - The maximum price of the property.
 *
 * @returns An array of property objects matching the filters.
 * @throws Error if there is an issue retrieving properties from the database.
 *
 * Example usage:
 *   const results = await retrieveProperties({ city: "London", minPrice: 100000, maxPrice: 500000 });
 */
export async function searchForProperties(filters: PropertyFilter) {
  const supabase = createSupabaseClient();

  let query = supabase.from("properties").select("*");

  if (filters.neighbourhood) {
    query = query.eq("neighbourhood", filters.neighbourhood);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }
  if (filters.bedrooms) {
    query = query.eq("bedrooms", filters.bedrooms);
  }
  if (filters.bathrooms) {
    query = query.eq("bathrooms", filters.bathrooms);
  }
  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error retrieving properties: ${error.message}`);
  }

  return data;
}

const schema = z.object({
  bedrooms: z.number().optional().describe("The number of bedrooms."),
  bathrooms: z.number().optional().describe("The number of bathrooms."),
  status: z
    .enum(["for_rent", "for_sale"])
    .optional()
    .describe("Whether the property is for rent or for sale."),
  propertyType: z
    .enum(["house", "apartment", "townhouse", "land", "condo"])
    .optional()
    .describe("The type of properties."),
  neighbourhood: z
    .string()
    .optional()
    .describe("The city to search for properties in."),
  minPrice: z.number().optional().describe("The minimum price of properties."),
  maxPrice: z.number().optional().describe("The maximum price of properties."),
});

export const searchForPropertiesTool = tool(searchForProperties, {
  name: "searchForProperties",
  description:
    "Searches for properties within the housing marketplace database.",
  schema: schema,
});

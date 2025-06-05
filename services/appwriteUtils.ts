// Appwrite Data Utilities
// This file contains helper functions for working with Appwrite collections

import { ID } from 'react-native-appwrite';
import { databases, parseJsonFields, stringifyJsonFields, JSON_FIELDS } from './appwrite';
import { COLLECTIONS, APPWRITE_DATABASE_ID } from './collections';

/**
 * Creates a new document in a collection with proper JSON handling
 */
export async function createDocument<T extends Record<string, any>>(
  collectionId: string, 
  data: T
): Promise<any> {
  // Determine which fields need JSON conversion
  const jsonFields = JSON_FIELDS[collectionId as keyof typeof JSON_FIELDS] || [];
  
  // Add timestamps
  const dataWithTimestamps = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Convert JSON fields to strings
  const preparedData = stringifyJsonFields(dataWithTimestamps, jsonFields);
  
  // Create document in Appwrite
  const response = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    ID.unique(),
    preparedData
  );
  
  // Parse response
  return parseJsonFields(response, jsonFields);
}

/**
 * Updates a document with proper JSON handling
 */
export async function updateDocument<T extends Record<string, any>>(
  collectionId: string,
  documentId: string,
  data: T
): Promise<any> {
  // Determine which fields need JSON conversion
  const jsonFields = JSON_FIELDS[collectionId as keyof typeof JSON_FIELDS] || [];
  
  // Add updated timestamp
  const dataWithTimestamps = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  // Convert JSON fields to strings
  const preparedData = stringifyJsonFields(dataWithTimestamps, jsonFields);
  
  // Update document in Appwrite
  const response = await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId,
    preparedData
  );
  
  // Parse response
  return parseJsonFields(response, jsonFields);
}

/**
 * Gets a document with proper JSON parsing
 */
export async function getDocument(
  collectionId: string,
  documentId: string
): Promise<any> {
  // Determine which fields need JSON conversion
  const jsonFields = JSON_FIELDS[collectionId as keyof typeof JSON_FIELDS] || [];
  
  // Get document from Appwrite
  const response = await databases.getDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId
  );
  
  // Parse response
  return parseJsonFields(response, jsonFields);
}

/**
 * Lists documents with proper JSON parsing
 */
export async function listDocuments(
  collectionId: string,
  queries: string[] = []
): Promise<any> {
  // Determine which fields need JSON conversion
  const jsonFields = JSON_FIELDS[collectionId as keyof typeof JSON_FIELDS] || [];
  
  // List documents from Appwrite
  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    collectionId,
    queries
  );
  
  // Parse each document in the response
  const documents = response.documents.map(doc => 
    parseJsonFields(doc, jsonFields)
  );
  
  return {
    ...response,
    documents
  };
}

/**
 * Deletes a document
 */
export async function deleteDocument(
  collectionId: string,
  documentId: string
): Promise<any> {
  return await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    collectionId,
    documentId
  );
}

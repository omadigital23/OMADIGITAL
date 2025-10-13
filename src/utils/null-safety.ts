// Comprehensive null safety utilities and helpers

/**
 * Type-safe null/undefined checks and utilities
 */

// Type guards
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return isNotNullOrUndefined(value);
}

// Safe accessors
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  return obj?.[key];
}

export function safeGetNested<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current ?? defaultValue;
}

// Array utilities
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

export function safeFirst<T>(array: T[] | null | undefined): T | undefined {
  return array?.[0];
}

export function safeLast<T>(array: T[] | null | undefined): T | undefined {
  return array?.[array.length - 1];
}

export function safeLength(array: any[] | null | undefined): number {
  return array?.length ?? 0;
}

// String utilities
export function safeString(value: string | null | undefined): string {
  return value ?? '';
}

export function safeTrim(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

export function safeToUpperCase(value: string | null | undefined): string {
  return value?.toUpperCase() ?? '';
}

export function safeToLowerCase(value: string | null | undefined): string {
  return value?.toLowerCase() ?? '';
}

// Number utilities
export function safeNumber(value: number | null | undefined, defaultValue = 0): number {
  return value ?? defaultValue;
}

export function safeParseInt(value: string | null | undefined, defaultValue = 0): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseFloat(value: string | null | undefined, defaultValue = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Date utilities
export function safeDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

export function safeDateString(value: string | Date | null | undefined): string {
  const date = safeDate(value);
  return date?.toISOString() ?? '';
}

// Object utilities
export function safeKeys<T extends Record<string, any>>(
  obj: T | null | undefined
): (keyof T)[] {
  return obj ? Object.keys(obj) as (keyof T)[] : [];
}

export function safeValues<T extends Record<string, any>>(
  obj: T | null | undefined
): T[keyof T][] {
  return obj ? Object.values(obj) : [];
}

export function safeEntries<T extends Record<string, any>>(
  obj: T | null | undefined
): [keyof T, T[keyof T]][] {
  return obj ? Object.entries(obj) as [keyof T, T[keyof T]][] : [];
}

// Function utilities
export function safeCall<T extends (...args: any[]) => any>(
  fn: T | null | undefined,
  ...args: Parameters<T>
): ReturnType<T> | undefined {
  return fn?.(...args);
}

export function safeCallWithDefault<T extends (...args: any[]) => any, D>(
  fn: T | null | undefined,
  defaultValue: D,
  ...args: Parameters<T>
): ReturnType<T> | D {
  return fn?.(...args) ?? defaultValue;
}

// DOM utilities
export function safeQuerySelector(
  selector: string,
  parent: Document | Element = document
): Element | null {
  try {
    return parent.querySelector(selector);
  } catch {
    return null;
  }
}

export function safeQuerySelectorAll(
  selector: string,
  parent: Document | Element = document
): Element[] {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch {
    return [];
  }
}

export function safeGetElementById(id: string): HTMLElement | null {
  try {
    return document.getElementById(id);
  } catch {
    return null;
  }
}

// Local storage utilities
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// JSON utilities
export function safeParseJSON<T>(
  json: string | null | undefined,
  defaultValue?: T
): T | undefined {
  if (!json) return defaultValue;
  
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export function safeStringifyJSON(
  obj: any,
  defaultValue = '{}'
): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

// URL utilities
export function safeURL(url: string | null | undefined): URL | null {
  if (!url) return null;
  
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function safeURLSearchParams(
  params: string | URLSearchParams | null | undefined
): URLSearchParams {
  if (!params) return new URLSearchParams();
  if (params instanceof URLSearchParams) return params;
  
  try {
    return new URLSearchParams(params);
  } catch {
    return new URLSearchParams();
  }
}

// Environment utilities
export function safeEnvVar(
  key: string,
  defaultValue?: string
): string | undefined {
  return process.env[key] ?? defaultValue;
}

export function requireEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

// Error handling utilities
export function safeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('An unknown error occurred');
}

export function safeErrorMessage(error: unknown): string {
  return safeError(error).message;
}

// Async utilities
export async function safeAsync<T>(
  promise: Promise<T>,
  defaultValue?: T
): Promise<T | typeof defaultValue> {
  try {
    return await promise;
  } catch {
    return defaultValue;
  }
}

export async function safeAsyncWithError<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    return [null, safeError(error)];
  }
}

// React utilities for null safety
export function useNullSafeState<T>(
  initialValue: T | null | undefined
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] {
  const [state, setState] = React.useState<T | null>(initialValue ?? null);
  return [state, setState];
}

// Type assertion utilities
export function assertIsDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value is null or undefined');
  }
}

export function assertIsNotNull<T>(
  value: T | null,
  message?: string
): asserts value is T {
  if (value === null) {
    throw new Error(message ?? 'Value is null');
  }
}

export function assertIsNotUndefined<T>(
  value: T | undefined,
  message?: string
): asserts value is T {
  if (value === undefined) {
    throw new Error(message ?? 'Value is undefined');
  }
}

// Import React for hooks
import React from 'react';
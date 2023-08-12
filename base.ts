import { PutResponse, QueryResponse, UpdateObject } from "./base.types.ts";
import { toArray } from "./utils/autil.ts";

export default class Base {
  private readonly key: string;
  private readonly id: string;
  private readonly name: string;
  private readonly baseUrl: string;

  constructor(key: string, id: string, name: string) {
    this.key = key;
    this.id = id;
    this.name = name;
    this.baseUrl = `https://database.deta.sh/v1/${this.id}/${this.name}`;
  }

  private async fetcher(options: BaseFetcherOptions) {
    const { body, urlParams, method } = options;
    const url = this.baseUrl + (urlParams ? `/${urlParams.join("/")}` : "");

    const response = await fetch(url, {
      method: method ? method : "GET",
      headers: {
        "X-API-Key": this.key,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const statusCode = response.status;
    const data = await response.json();

    if (statusCode >= 200 && statusCode < 300) {
      return data;
    } else {
      return Promise.reject(data);
    }
  }

  /**
   * Stores multiple items in a single request. This request overwrites an item if the key already exists.
   * @param `items` An array of items object to be stored.
   */
  async put<T>(items: T | T[]): Promise<PutResponse<T & { key: string }>> {
    const body = { items: toArray(items) };
    return await this.fetcher({
      body,
      method: "PUT",
      urlParams: ["items"],
    });
  }

  /**
   * Get a stored item.
   * @param key The key (aka. ID) of the item you want to retrieve
   */
  async get<T>(key: string): Promise<T & { key: string }> {
    return await this.fetcher({
      urlParams: ["items", key],
    });
  }

  /**
   * Delete a stored item.
   * @param key The key (aka. ID) of the item you want to delete.
   */
  async delete(key: string): Promise<{ key: string }> {
    return await this.fetcher({
      urlParams: ["items", key],
      method: "DELETE",
    });
  }

  /**
   * Creates a new item only if no item with the same `key` exists.
   * @param item The item to be stored.
   */
  async insert<T>(item: T): Promise<T & { key: string }> {
    const body = { item };
    return await this.fetcher({
      urlParams: ["items"],
      method: "POST",
      body,
    });
  }

  /**
   * Updates an item only if an item with key exists.
   * @param key The key of the item
   * @param body the update object
   */
  async update<T>(
    key: string,
    body: UpdateObject<T>
  ): Promise<UpdateObject<T> & { key: string }> {
    // check if delete keys are duplicated
    const hasNoDuplicates = (arr: (keyof T)[]): arr is (keyof T)[] => {
      return new Set(arr).size === arr.length;
    };
    if (body.delete && hasNoDuplicates(body.delete)) {
      return Promise.reject({
        errors: ["delete keys are duplicated"],
      });
    }
    return await this.fetcher({
      method: "PATCH",
      urlParams: ["items", key],
      body: body as DefaultObject,
    });
  }

  async query<T>(
    query: DefaultObject[] | DefaultObject = [],
    limit?: number,
    last?: string
  ): Promise<QueryResponse<T>> {
    const body = { query: toArray(query), limit, last };
    return await this.fetcher({
      method: "POST",
      urlParams: ["query"],
      body,
    });
  }
}

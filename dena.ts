// import * as defaults from './defaults.ts'
// import { defaultize } from './utils/autil.ts'

import Base from "./base.ts";
import Drive from "./drive.ts";

export default class Dena {
  private readonly key: string;
  private readonly id: string;

  constructor(key: string) {
    if (key.length === 0) throw new Error("Project key is empty");
    this.key = key;
    this.id = key.split("_")[0];
  }

  /**
   * Create a new Base instance
   *
   * @param name Base name
   * @returns Base instance
   */
  getBase<T>(name: string) {
    return new Base(this.key, this.id, name);
  }

  /**
   * Create a new Drive instance
   *
   * @param name Drive name
   * @returns Drive instance
   */
  getDrive(name: string) {
    return new Drive(this.key, this.id, name);
  }
}

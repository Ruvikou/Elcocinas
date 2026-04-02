export class RecipeImage {
  private readonly url: string;
  private readonly isMain: boolean;
  private readonly alt: string;

  constructor(url: string, isMain: boolean = false, alt: string = '') {
    if (!url || url.trim().length === 0) {
      throw new Error('Image URL is required');
    }
    this.url = url;
    this.isMain = isMain;
    this.alt = alt;
  }

  getUrl(): string {
    return this.url;
  }

  getIsMain(): boolean {
    return this.isMain;
  }

  getAlt(): string {
    return this.alt;
  }

  setAsMain(): RecipeImage {
    return new RecipeImage(this.url, true, this.alt);
  }

  toJSON() {
    return {
      url: this.url,
      isMain: this.isMain,
      alt: this.alt
    };
  }
}

/**
 * Base class for all errors thrown by the bot
 */
export class ApiError extends Error {
  caption?: string;

  doujin_id?: string;

  constructor(message: string, caption?: string, doujin_id?: string) {
    super(message);
    this.caption = caption;
    this.doujin_id = doujin_id;
    this.name = 'ApiError';
  }
}

/**
 * Error thrown when the url is good but there is no results
 */
export class NoResultsError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'NoResultsError';
    this.caption = 'No results found!';
  }
}
/**
 * Error thrown when the url passed validation but is malformed
 */
export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.caption =
            'There was an error with your request to the ExHentai/E-hentai API';
  }
}
/**
 * Error thrown when a image url is bad
 */
export class BadImageUrlError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'BadImageUrlError';
    this.caption =
            'There was an error with one of the image url. Please try again later';
  }
}
/**
 * Error thrown when a doujin is not found on ExHentai with the given tags
 */
export class NoDoujinFoundError extends ApiError {
  tags: string;

  constructor(message: string, tags: string) {
    super(message);
    this.name = 'NoDoujinFoundError';
    this.caption = 'No doujin found with the given tags.';
    this.tags = tags;
  }
}
/**
 * Error thrown when the given tags are not valid
 */
export class InvalidTagFormatError extends ApiError {
  tags: string;

  constructor(message: string, tags: string) {
    super(message);
    this.name = 'InvalidTagFormatError';
    this.caption = 'Invalid tag format. ';
    this.tags = tags;
  }
}
/**
 * Error thrown when an error occurs whilst fetching the gallery urls
 */
export class GalleryUrlsFetchError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'GalleryUrlsFetchError';
    this.caption =
            'There was an error while fetching the gallery urls. Please try again later';
  }
}

/**
 * Error thrown when an error occurs whilst creating the user
 */
export class UserCreationError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'UserCreationError';
    this.caption =
            'There was an error while creating your account. Please try again later';
  }
}

/**
 * Error thrown when an error occurs whilst updating the user
 */
export class UserUpdateError extends ApiError {
  userId: number;

  constructor(message: string, userId: number) {
    super(message);
    this.name = 'UserUpdateError';
    this.caption =
            'There was an error while updating your account. Please try again later';
    this.userId = userId;
  }
}

/**
 * Error thrown when an error occurs whilst  deleting the user
 */
export class UserDeleteError extends ApiError {
  userId: number;

  constructor(message: string, userId: number) {
    super(message);
    this.name = 'UserDeleteError';
    this.caption =
            'There was an error while deleting your account. Please try again later';
    this.userId = userId;
  }
}

/**
 * Error thrown when an error occurs whilst finding the user
 */
export class UserNotFoundError extends ApiError {
  userId: number;

  constructor(message: string, userId: number) {
    super(message);
    this.name = 'UserNotFoundError';
    this.caption =
            'There was an error while finding your account. Please try again later';
    this.userId = userId;
  }
}

/**
 * Error thrown when an error occurs whilst fetching the settings
 */
export class FetchSettingsError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'FetchSettingsError';
    this.caption =
            'There was an error while fetching the settings. Please try again later';
  }
}

/**
 * Error thrown when an error occurs when saving the doujin to the database
 */
export class DoujinDatabaseSaveError extends ApiError {
  doujin_id: string;

  caption: string;

  constructor(message: string, doujin_id: string) {
    super(message);
    this.name = 'DoujinDatabaseSaveError';
    this.caption =
            'There was an error while saving the doujin to the database. Please try again later';
    this.doujin_id = doujin_id;
  }
}


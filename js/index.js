(function ($) {
  'use strict';

  /** Fields labels that are used in the messages. */
  const LABELS = {
    'confirm-password': 'password',
  };

  /**
   * Replaces placeholders in the string.
   *
   * @example
   * replaceWithPlaceholders('The {attribute} must be at least {min} characters.', {min: 3});
   * //=> The {attribute} must be at least 3 characters.
   *
   * replaceWithPlaceholders('The {attribute} must be at least {min} characters.', {min: 3}, true);
   * //=> The attribute must be at least 3 characters.
   *
   * @param string {string} A string to process.
   * @param replacements {Object} List of replacements.
   * @param [unwrap=false] {boolean} Unwrap missed replacements.
   *
   * @returns {string} The result string.
   */
  function replaceWithPlaceholders(string, replacements, unwrap = false) {
    return string.replace(
      /{(\w+)}/g,
      function (placeholderWithDelimiters, placeholderWithoutDelimiters) {
        return replacements[placeholderWithoutDelimiters] || (unwrap ? placeholderWithoutDelimiters : placeholderWithDelimiters);
      }
    );
  }

  /**
   * List of validations functions.
   */
  const validations = {
    /**
     * Returns required validator.
     *
     * @returns {Function} Required validator.
     */
    required() {
      /**
       * @param value {any} Value to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function required(value) {
        if (value.length > 0) {
          return true;
        }

        return 'The {attribute} field is required.';
      };
    },
    /**
     * Returns email validator.
     *
     * @returns {Function} Email validator.
     */
    email() {
      /**
       * @param value {any} Value to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function email(value) {
        if (/[a-zA-Z+\d]+@[a-zA-Z\d]+\.[a-zA-Z\d]+/.test(value)) {
          return true;
        }

        return 'The {attribute} must be a valid email address.';
      };
    },
    /**
     * Returns minimum string length validator.
     *
     * @param min {number} Minimum length.
     *
     * @returns {Function} Minimum string length validator.
     */
    minLength(min) {
      /**
       * @param value {string} String to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function minLength(value) {
        if (value.length >= min) {
          return true;
        }

        return replaceWithPlaceholders('The {attribute} must be at least {min} characters.', {min});
      };
    },
    /**
     * Returns maximum string length validator.
     *
     * @param max {number} Maximum length.
     *
     * @returns {Function} Maximum string length validator.
     */
    maxLength(max) {
      /**
       * @param value {string} String to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function maxLength(value) {
        if (value.length <= max) {
          return true;
        }

        return replaceWithPlaceholders('The {attribute} must not be greater than {max} characters', {max});
      };
    },
    /**
     * Returns maximum and minimum string length validator.
     *
     * @param min {number} Minimum length.
     * @param max {number} Maximum length.
     *
     * @returns {Function} Maximum and minimum string length validator.
     */
    betweenLength(min, max) {
      /**
       * @param value {string} String to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function betweenLength(value) {
        if (value.length <= min && value.length >= max) {
          return true;
        }

        return replaceWithPlaceholders('The {attribute} must be between {min} and {max} characters.', {min, max});
      };
    },
    /**
     * Returns validator to confirmation that 2 fields are equal.
     *
     * @param originalAttribute {string} Attribute of related field.
     *
     * @returns {Function} Validator to confirmation that 2 fields are equal.
     */
    confirmation(originalAttribute) {
      /**
       * @param value {any} Value to validate.
       *
       * @returns {boolean|string} True if value is valid or error string.
       */
      return function confirmation(value) {
        const originalValue = getValue(originalAttribute);
        if (value === originalValue) {
          return true;
        }

        return 'The {attribute} confirmation does not match.';
      }
    },
    /** Dummy validation to test breakpoints with exceptions. */
    // throwError() {
    //   return function throwError() {
    //     throw new Error('Dummy validation');
    //   }
    // },
  };

  /**
   * Get field value by attribute.
   *
   * @param attribute {string} Field attribute.
   *
   * @returns {string} Field value.
   */
  function getValue(attribute) {
    return $(`[name="${attribute}"]`).val();
  }

  /**
   * Display error text of the field by attribute.
   *
   * @param attribute {string} Field attribute.
   * @param error {string} Error message.
   *
   * @returns {*|jQuery} jQuery field object.
   */
  function displayError(attribute, error) {
    return $(`[name="${attribute}"]`).closest('.form-group').find('.form-text').text(error);
  }

  /**
   * Hide error text of the field by attribute.
   *
   * @param attribute {string} Field attribute.
   *
   * @returns {*|jQuery} jQuery field object.
   */
  function hideError(attribute) {
    return displayError(attribute, '');
  }

  /**
   * Hide errors text of the fields.
   *
   * @returns {*|jQuery} jQuery fields object.
   */
  function hideErrors() {
    return $('.form-text').text('');
  }

  /**
   * Validation fields settings.
   */
  const settings = {
    name: [validations.required()],
    email: [validations.required(), validations.email()],
    username: [validations.required(), validations.betweenLength(3, 16)],
    password: [validations.required(), validations.minLength(3)],
    'confirm-password': [validations.confirmation('password')],
  };

  /**
   * Execute form validation.
   *
   * @returns {boolean} Form validation state.
   */
  function validate() {
    let isValid = true;
    for (const [attribute, validations] of Object.entries(settings)) {
      for (const validation of validations) {
        const value = getValue(attribute);
        const error = validation(value);

        if (typeof error === 'string') {
          isValid = false;
          displayError(
            attribute,
            replaceWithPlaceholders(error, {attribute: LABELS[attribute] || attribute}, true)
          );
          break;
        } else {
          hideError(attribute);
        }
      }
    }

    return isValid;
  }

  /**
   * Initialization logic.
   */
  $(document).ready(function () {
    $('#form').on('submit', function (e) {
      e.preventDefault();

      if (true === validate()) {
        e.target.reset();
        hideErrors();
        alert('Account has been created');
      }
    }).on('reset', function (e) {
      hideErrors();
    });
  });

})(jQuery);

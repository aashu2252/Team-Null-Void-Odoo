/**
 * Formik Zod Validation Schema Adapter
 * Runs safeParse on Formik values and returns mapped error messages.
 */
export const validateWithZod = (schema) => (values) => {
  const result = schema.safeParse(values);
  if (result.success) {
    return {};
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  });
  return errors;
};

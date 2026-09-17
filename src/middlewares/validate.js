import { ValidationError } from '../errors/index.js';

export function validate(schemas) {
  return (req, res, next) => {
    const details = [];

    for (const source of ['body', 'params', 'query']) {
      const schema = schemas[source];
      if (!schema) continue;

      const { error, value } = schema.validate(req[source] ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        for (const d of error.details) {
          details.push({
            field: `${source}.${d.path.join('.')}`,
            message: d.message,
          });
        }
      } else {
        req[source] = value;
      }
    }

    if (details.length > 0) {
      return next(new ValidationError('Некорректные данные запроса', details));
    }

    next();
  };
}
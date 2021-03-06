import template from 'es6-template-strings';
import flatten from './flatten';

const l10nProxyHandler = {
  get(obj, prop) {
    const { req, key, owner } = obj;
    const finalKey = key ? `${key}.${prop}` : prop;
    const fnObj = owner.translate.bind(owner, req, finalKey);
    Object.assign(fnObj, {
      req,
      owner,
      key: key ? `${key}.${prop}` : prop,
    });
    return new Proxy(fnObj, l10nProxyHandler);
  },
};

export class L10N {
  constructor(context, config) {
    const strings = config.strings || {};
    this.default = config.default;
    this.inverted = {};
    Object.entries(strings).forEach(([culture, dict]) => {
      const compositeKeys = flatten(dict);
      Object.entries(compositeKeys).forEach(([stringName, value]) => {
        this.inverted[stringName] = this.inverted[stringName] || {
          cultures: [],
          values: {},
        };
        const detail = this.inverted[stringName];
        detail.cultures.push(culture);
        detail.values[culture] = value;
      });
    });
  }

  attach(req) {
    req.l10n = new Proxy({ req, owner: this }, l10nProxyHandler);
  }

  translate(req, stringKey, defaultTemplate, templateArguments) {
    const detail = this.inverted[stringKey];
    let bestTemplate = (typeof defaultTemplate === 'string' || Array.isArray(defaultTemplate)) ? defaultTemplate : null;
    if (detail) {
      const best = req.headers['accept-language'] && req.acceptsLanguages(detail.cultures);
      if (best && detail.values[best]) {
        bestTemplate = detail.values[best];
      } else if (this.default && detail.values[this.default]) {
        bestTemplate = detail.values[this.default];
      }
    }
    if (!bestTemplate) {
      throw new Error(`Invalid l10n call for ${stringKey}`);
    }
    if (Array.isArray(bestTemplate)) {
      bestTemplate = bestTemplate[Math.floor(Math.random() * bestTemplate.length)];
    }
    const args = (typeof defaultTemplate === 'object') ? defaultTemplate : templateArguments;
    return template(bestTemplate, args);
  }
}

export default function middlewareFactory(config) {
  const l10n = new L10N(null, config);
  return (req, res, next) => {
    l10n.attach(req);
    next();
  };
}

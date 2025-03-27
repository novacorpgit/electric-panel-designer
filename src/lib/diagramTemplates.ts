
import { GoJSDiagram } from './goJsInterop';
import { TemplateOptions } from './templates/baseTemplates';
import { createBaseNodeTemplate } from './templates/baseNodeTemplate';
import { createCircuitBreakerTemplates } from './templates/circuitBreakerTemplates';
import { createSchneiderTemplates } from './templates/schneiderTemplates';
import { createPowerComponentTemplates } from './templates/powerComponentTemplates';
import { createGroupTemplate } from './templates/groupTemplate';
import { createLinkTemplate } from './templates/linkTemplate';

export const createNodeTemplates = (options: TemplateOptions) => {
  const templates = new Map();
  
  // Create base node template
  const baseNodeTemplate = createBaseNodeTemplate(options);
  templates.set("default", baseNodeTemplate);
  
  // Add circuit breaker templates
  const circuitBreakerTemplates = createCircuitBreakerTemplates(options);
  circuitBreakerTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  // Add Schneider templates
  const schneiderTemplates = createSchneiderTemplates(options);
  schneiderTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  // Add power component templates
  const powerComponentTemplates = createPowerComponentTemplates(options);
  powerComponentTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  return templates;
};

export { createGroupTemplate, createLinkTemplate };


import { GoJSDiagram } from './goJsInterop';
import { TemplateOptions } from './templates/baseTemplates';
import { createBaseNodeTemplate } from './templates/baseNodeTemplate';
import { createCircuitBreakerTemplates } from './templates/circuitBreakerTemplates';
import { createSchneiderTemplates } from './templates/schneiderTemplates';
import { createPowerComponentTemplates } from './templates/powerComponentTemplates';
import { createGroupTemplate } from './templates/groupTemplate';
import { createLinkTemplate } from './templates/linkTemplate';

export const createNodeTemplates = (go: GoJSDiagram, CellSize: any, highlightGroup: (grp: any, show: boolean) => boolean) => {
  const templates = new Map();
  
  // Create base node template
  const baseNodeTemplate = createBaseNodeTemplate({ go, CellSize, highlightGroup });
  templates.set("default", baseNodeTemplate);
  
  // Add circuit breaker templates
  const circuitBreakerTemplates = createCircuitBreakerTemplates({ go, CellSize, highlightGroup });
  circuitBreakerTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  // Add Schneider templates
  const schneiderTemplates = createSchneiderTemplates({ go, CellSize, highlightGroup });
  schneiderTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  // Add power component templates
  const powerComponentTemplates = createPowerComponentTemplates({ go, CellSize, highlightGroup });
  powerComponentTemplates.forEach((template, key) => {
    templates.set(key, template);
  });
  
  return templates;
};

export { createGroupTemplate, createLinkTemplate };

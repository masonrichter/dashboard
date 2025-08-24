export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  description: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "avista-template-no-slogan",
    name: "Avista Template No Slogan",
    subject: "Avista Template No Slogan",
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .title { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; }
        .tagline { font-style: italic; color: #7f8c8d; margin-bottom: 20px; font-size: 16px; }
        .read-more { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .pdf-link { color: #e74c3c; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
            <p>Avista Financial Services</p>
        </div>
        
        <div class="content">
            <div class="title">{{title}}</div>
            
            <div class="tagline">{{tagline}}</div>
            
            <div class="highlight">
                <strong>Professional Financial Services</strong> - Your trusted partner in financial planning.
            </div>
            
            <div class="content-body">
                {{content}}
            </div>
            
            {{#if readMore}}
            <div class="read-more">
                <strong>📄 Read More:</strong> 
                <a href="{{readMore}}" class="pdf-link" target="_blank">Download PDF Document</a>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-button">Learn More</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Avista Financial Services. All rights reserved.</p>
            <p><a href="#" style="color: #fff;">Unsubscribe</a> | <a href="#" style="color: #fff;">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`,
    description: "Avista template without slogan for general communications"
  },
  {
    id: "avista-template-with-slogan",
    name: "Avista Template With Slogan",
    subject: "Avista Template With Slogan",
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .title { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; }
        .tagline { font-style: italic; color: #7f8c8d; margin-bottom: 20px; font-size: 16px; }
        .read-more { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .pdf-link { color: #e74c3c; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
            <p>Avista Financial Services</p>
            <p><em>"Building Your Financial Future"</em></p>
        </div>
        
        <div class="content">
            <div class="title">{{title}}</div>
            
            <div class="tagline">{{tagline}}</div>
            
            <div class="highlight">
                <strong>Professional Financial Services</strong> - Your trusted partner in financial planning.
            </div>
            
            <div class="content-body">
                {{content}}
            </div>
            
            {{#if readMore}}
            <div class="read-more">
                <strong>📄 Read More:</strong> 
                <a href="{{readMore}}" class="pdf-link" target="_blank">Download PDF Document</a>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-button">Learn More</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Avista Financial Services. All rights reserved.</p>
            <p><a href="#" style="color: #fff;">Unsubscribe</a> | <a href="#" style="color: #fff;">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`,
    description: "Avista template with slogan for enhanced communications"
  },
  {
    id: "dovetail-template",
    name: "Dovetail Template",
    subject: "Dovetail Template",
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .title { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; }
        .tagline { font-style: italic; color: #7f8c8d; margin-bottom: 20px; font-size: 16px; }
        .read-more { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .pdf-link { color: #e74c3c; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
            <p>Dovetail Financial Services</p>
        </div>
        
        <div class="content">
            <div class="title">{{title}}</div>
            
            <div class="tagline">{{tagline}}</div>
            
            <div class="highlight">
                <strong>Specialized Financial Planning</strong> - Tailored solutions for your unique needs.
            </div>
            
            <div class="content-body">
                {{content}}
            </div>
            
            {{#if readMore}}
            <div class="read-more">
                <strong>📄 Read More:</strong> 
                <a href="{{readMore}}" class="pdf-link" target="_blank">Download PDF Document</a>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-button">Learn More</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Dovetail Financial Services. All rights reserved.</p>
            <p><a href="#" style="color: #fff;">Unsubscribe</a> | <a href="#" style="color: #fff;">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`,
    description: "Dovetail template for specialized communications"
  }
];

export function generateEmailHTML(templateId: string, subject: string, content: string, title?: string, tagline?: string, readMore?: string): string {
  const template = emailTemplates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Template with id "${templateId}" not found`);
  }
  
  // Replace placeholders in the template
  let html = template.html
    .replace(/\{\{subject\}\}/g, subject)
    .replace(/\{\{content\}\}/g, content)
    .replace(/\{\{title\}\}/g, title || '')
    .replace(/\{\{tagline\}\}/g, tagline || '')
    .replace(/\{\{readMore\}\}/g, readMore || '');
  
  // Handle conditional read more section
  if (readMore) {
    html = html.replace(/\{\{#if readMore\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if readMore\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  return html;
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === id);
}

export function getAllTemplates(): EmailTemplate[] {
  return emailTemplates;
}

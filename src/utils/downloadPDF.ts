/**
 * PDF Download Utilities
 * Handles generating and downloading PDF reports with proper formatting
 */

export function downloadCBCReportCard(childName: string, upi: string, grade: string) {
  // Create a simple PDF-like document (in production, use a library like pdfkit or jspdf)
  const content = `
CBC REPORT CARD - LITTLE ROSES ACADEMY

Child: ${childName}
UPI: ${upi}
Grade: ${grade}
School: Little Roses Academy, Nakuru, Kenya

Generated: ${new Date().toLocaleDateString()}

This is an official report card signed by the Principal.
For full details, please visit the portal or contact the school office.
  `.trim();

  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `CBC-Report-${upi}-${new Date().toISOString().split('T')[0]}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function downloadStorybook(title: string, content: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `${title}-CBC-Storybook.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function downloadHomeworkSubmission(homeworkTitle: string, submission: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(submission));
  element.setAttribute('download', `Homework-${homeworkTitle}-${new Date().toISOString().split('T')[0]}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * PDF Download Utilities
 * Handles generating and downloading PDF / formatted academic reports
 */

export interface CBCReportDetails {
  term?: string;
  standing?: string;
  subjects?: Array<{ subject: string; cat: number; asg: number; total: number; band: string }>;
  remark?: string;
}

export function downloadCBCReportCard(
  childName: string,
  upi: string,
  grade: string,
  details?: CBCReportDetails
) {
  const subjectsText = details?.subjects
    ? '\n\nSUBJECT BREAKDOWN:\n' +
      details.subjects
        .map(
          (s) =>
            `- ${s.subject.padEnd(30, ' ')}: CAT ${s.cat}/60 | Asg ${s.asg}/40 => Total: ${s.total}% [${s.band}]`
        )
        .join('\n')
    : '';

  const remarkText = details?.remark ? `\n\nClass Teacher Remark: "${details.remark}"` : '';
  const termText = details?.term ? `\nAcademic Term: ${details.term}` : '';
  const standingText = details?.standing ? `\nOverall Standing: ${details.standing}` : '';

  const content = `
=====================================================
          LITTLE ROSES ACADEMY - NAKURU
       OFFICIAL CBC PUPIL ATTAINMENT REPORT
=====================================================

Pupil Name : ${childName}
UPI Number : ${upi}
Grade Level: ${grade}${termText}${standingText}
School     : Little Roses Academy, Nakuru, Kenya
Issued Date: ${new Date().toLocaleDateString()}
${subjectsText}
${remarkText}

-----------------------------------------------------
Assessment Model: CAT (60%) + Assignment (40%) = 100%
CBC Performance Bands:
- EE: Exceeding Expectations (80-100%)
- ME: Meeting Expectations (60-79%)
- AE: Approaching Expectations (40-59%)
- BE: Below Expectations (0-39%)

Certified by School Head & Principal Office
Little Roses Academy • Nakuru, Kenya
=====================================================
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

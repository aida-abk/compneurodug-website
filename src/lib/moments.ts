import type { ImageMetadata } from 'astro';
import fullRoom from '../assets/moments/full-room.webp';
import speakerSlide from '../assets/moments/speaker-slide.webp';
import conversation from '../assets/moments/conversation.webp';
import fairTableChat from '../assets/moments/fair-table-chat.jpg';
import studentAndProfessor from '../assets/moments/student-and-professor.webp';
import snackTable from '../assets/moments/snack-table.webp';
import carneySlide from '../assets/moments/carney-slide.webp';
import fairTableLaptops from '../assets/moments/fair-table-laptops.jpg';
import audienceSide from '../assets/moments/audience-side.webp';

/*
 * Photos for the homepage "Moments" grid, in display order. The first one is
 * shown large. To add a photo: put it in src/assets/moments/ (strip location
 * data first), import it above and add a line below with a short description
 * of what's in it for screen readers. Only use photos of people who are happy
 * to be on a public site.
 */
export interface Moment {
  src: ImageMetadata;
  alt: string;
}

export const MOMENTS: Moment[] = [
  { src: fullRoom, alt: 'A full room of students listening to a talk' },
  { src: speakerSlide, alt: 'A speaker presents a slide on zebrafish behaviour' },
  { src: conversation, alt: 'Three attendees laughing in conversation after a talk' },
  { src: fairTableChat, alt: 'DUG members talk with a student at the club fair table' },
  { src: studentAndProfessor, alt: 'A student talks with a faculty member after a talk' },
  { src: snackTable, alt: 'Students gather around the snack table' },
  { src: carneySlide, alt: "Students and a researcher in front of a slide reading 'Connect with Brown's Brain Science Researchers'" },
  { src: fairTableLaptops, alt: 'A student signs up for the mailing list at the club fair' },
  { src: audienceSide, alt: 'Audience members follow a talk, seen from the side' },
];

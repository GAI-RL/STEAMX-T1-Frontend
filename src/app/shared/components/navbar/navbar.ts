import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnDestroy {
  
  menuOpen = false;
  isScrolled = false;
  activeSection = 'hero';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Glassmorphism effect triggers at 20px for smoother transition
    this.isScrolled = window.scrollY > 20;
    this.updateActiveSection();
  }

  updateActiveSection() {
    const sections = ['hero', 'features', 'pricing', 'testimonials', 'about', 'contact'];
    
    // Default to hero if at top
    if (window.scrollY < 100) {
      this.activeSection = 'hero';
      return;
    }

    // Get navbar height for offset calculation
    const navbarHeight = 72;
    const scrollPosition = window.scrollY + navbarHeight + 100;

    // Find which section we're currently viewing
    let currentSection = 'hero';
    
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionBottom = sectionTop + element.offsetHeight;
        
        // If scroll position is within this section
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = sectionId;
        }
      }
    }

    this.activeSection = currentSection;

    // Special case: if very close to bottom, activate contact
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      this.activeSection = 'contact';
    }
  }

  isActive(section: string): boolean {
    return this.activeSection === section;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    
    // Prevent body scroll when mobile menu is open
    if (this.menuOpen) {
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    
    // Close mobile menu first
    this.closeMenu();
    
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Set active section immediately for better UX
      this.activeSection = sectionId;
    }
  }

  // Cleanup on component destroy
  ngOnDestroy() {
    // Ensure body scroll is restored if component is destroyed with menu open
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
}
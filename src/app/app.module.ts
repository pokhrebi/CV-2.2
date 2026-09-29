import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ResumeComponent } from './pages/resume/resume.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { AdBannerComponent } from './shared/ad-banner/ad-banner.component';
import { CookieConsentComponent } from './shared/cookie-consent/cookie-consent.component';
import { SkillsChartComponent } from './pages/about/skills-chart/skills-chart.component';
import { BlogListComponent } from './pages/blog/blog-list/blog-list.component';
import { BlogPostDetailComponent } from './pages/blog/blog-post-detail/blog-post-detail.component';
import { BlogEditorComponent } from './pages/blog/blog-editor/blog-editor.component';
import { AuthModalComponent } from './pages/blog/auth-modal/auth-modal.component';
import { BlogAdminComponent } from './pages/blog/blog-admin/blog-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    ProjectsComponent,
    ResumeComponent,
    ContactComponent,
    PrivacyComponent,
    AdBannerComponent,
    CookieConsentComponent,
    SkillsChartComponent,
    BlogListComponent,
    BlogPostDetailComponent,
    BlogEditorComponent,
    AuthModalComponent,
    BlogAdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

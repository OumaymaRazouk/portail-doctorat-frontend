import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionService } from '../../core/services/inscription.service';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

@Component({
  selector: 'app-inscription-pdf-viewer',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout [title]="fileName || 'Document'">
      <div class="viewer-page">
        <div class="toolbar">
          <button type="button" class="btn" (click)="goBack()">Retour</button>
          <span class="info">{{ fileName }}</span>
        </div>
        <div class="body" #container>
          <div *ngIf="loading" class="status">Chargement du document...</div>
          <div *ngIf="!loading && error" class="status error">{{ error }}</div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [
    `.viewer-page { background:#f3f4f6; min-height:100vh; padding:16px; box-sizing:border-box; }
     .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
     .btn { background:#4f46e5; color:#fff; border:0; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:13px; }
     .btn:hover { background:#4338ca; }
     .info { font-size:14px; color:#374151; word-break:break-all; }
     .body { background:#ffffff; border-radius:12px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.06); max-height:calc(100vh - 120px); overflow-y:auto; }
     .status { font-size:14px; color:#4b5563; }
     .status.error { color:#b91c1c; }
    `]
})
export class InscriptionPdfViewerComponent {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  fileName = '';
  loading = true;
  error = '';
  private isPdf = true;

  constructor(
    private route: ActivatedRoute,
    private service: InscriptionService,
    private location: Location
  ) {
    this.init();
  }

  private init() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const fileName = this.route.snapshot.paramMap.get('fileName') || '';
    this.fileName = fileName;
    if (!id || !fileName) {
      this.error = 'Parametres manquants pour afficher le document';
      this.loading = false;
      return;
    }
    this.isPdf = fileName.toLowerCase().endsWith('.pdf');
    this.service.getAttachmentBlob(id, fileName).subscribe(
      async (blob: any) => {
        try {
          if (this.isPdf) {
            const arrayBuffer = await blob.arrayBuffer();
            const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            await this.renderAllPages(pdf);
          } else {
            this.renderImage(blob);
          }
        } catch (e) {
          // aide au debug si rendu echoue
          // eslint-disable-next-line no-console
          console.error('Erreur rendu PDF', e);
          this.error = 'Erreur lors du rendu du PDF';
        } finally {
          this.loading = false;
        }
      },
      () => {
        this.error = 'Impossible de charger ce document';
        this.loading = false;
      }
    );
  }

  private renderImage(blob: Blob) {
    const container = this.containerRef.nativeElement;
    container.innerHTML = '';
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.margin = '0 auto';
    img.style.borderRadius = '8px';
    container.appendChild(img);
  }

  private async renderAllPages(pdf: any) {
    const container = this.containerRef.nativeElement;
    container.innerHTML = '';
    const pageCount = pdf.numPages || 0;
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 16px auto';
      container.appendChild(canvas);
      await page.render({ canvasContext: context, viewport }).promise;
    }
  }

  goBack() {
    this.location.back();
  }
}

import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.models';

@Directive({ selector: '[hasRole]' })
export class HasRoleDirective {
  private roles: Role[] = [];
  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef, private auth: AuthService) {}
  @Input() set hasRole(value: Role | Role[]) {
    this.roles = Array.isArray(value) ? value : [value];
    this.vcr.clear();
    if (this.auth.hasAnyRole(this.roles)) this.vcr.createEmbeddedView(this.tpl);
  }
}

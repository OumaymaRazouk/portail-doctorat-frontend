import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../../environments/environment';

export type SoutenanceStatus =
  | 'BROUILLON'
  | 'SOUMIS'
  | 'PREREQUIS_EN_VERIFICATION'
  | 'PREREQUIS_VALIDES'
  | 'JURY_PROPOSE'
  | 'JURY_VALIDE'
  | 'SOUTENANCE_AUTORISEE'
  | 'PLANIFICATION_PROPOSEE'
  | 'SOUTENANCE_PLANIFIEE'
  | 'SOUTENANCE_EFFECTUEE'
  | 'REJETE';

export interface SoutenanceDTO {
  id: string;
  doctorantId: string;
  directeurId: string;
  status: SoutenanceStatus;
  titreTheseDefinitif?: string;
  resumeFinal?: string;
  motsCles?: string[];
  publicationsCount: number;
  communicationsCount: number;
  heuresFormationCumulees: number;
  dureeDoctoratAnnees: number;
  manuscritPath?: string;
  rapportThesePath?: string;
  rapportAntiPlagiatPath?: string;
  preuvesPublicationsPath?: string;
  preuvesCommunicationsPath?: string;
  attestationsFormationsPath?: string;
  demandeManuscritePath?: string;
  dateSoumission?: string;
  dateAutorisation?: string;
  datePlanifiee?: string;
  salle?: string;
  lieu?: string;
}

export interface SoutenanceDraftInput {
  doctorantId: string;
  directeurId: string;
  titreTheseDefinitif: string;
  resumeFinal: string;
  motsCles: string[];
  publicationsCount: number;
  communicationsCount: number;
  heuresFormationCumulees: number;
  dureeDoctoratAnnees: number;
  manuscritPath?: string;
  rapportThesePath?: string;
  rapportAntiPlagiatPath?: string;
  preuvesPublicationsPath?: string;
  preuvesCommunicationsPath?: string;
  attestationsFormationsPath?: string;
  demandeManuscritePath?: string;
}

export interface JuryMemberInput {
  nom: string;
  prenom: string;
  affiliation: string;
  email: string;
  telephone?: string;
  role: 'RAPPORTEUR' | 'EXAMINATEUR' | 'PRESIDENT' | 'INVITE';
}

export interface JuryMemberView {
  nom: string;
  prenom: string;
  affiliation: string;
  role: string;
}

export interface SoutenanceStatView {
  id: string;
  doctorantId: string;
  directeurId: string;
  status: SoutenanceStatus | string;
  titreTheseDefinitif?: string;
  datePlanifiee?: string;
  salle?: string;
  lieu?: string;
  jury?: JuryMemberView[];
}

export interface PlanificationInput {
  dateHeure: string;
  salle: string;
  lieu: string;
  lienVisioconference?: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export interface WeeklySoutenanceSummary {
  weekStart: string;
  weekEnd: string;
  total: number;
  soutenances?: SoutenanceStatView[];
}

@Injectable({ providedIn: 'root' })
export class SoutenanceService {
  private api = inject(ApiService);
  private graphqlUrl = environment.endpoints.soutenanceGraphql || '/soutenance/graphql';

  private execute<T>(query: string, variables?: any) {
    const body = { query, variables };
    return this.api.post<GraphQLResponse<T>>(this.graphqlUrl, body);
  }

  getWeeklyStats(start?: string, end?: string, includeDetails = false) {
    let url = '/stats/soutenances/weekly';
    const params: string[] = [];
    if (start) params.push(`start=${encodeURIComponent(start)}`);
    if (end) params.push(`end=${encodeURIComponent(end)}`);
    if (includeDetails) params.push('includeDetails=true');
    if (params.length > 0) {
      url = url + '?' + params.join('&');
    }
    return this.api.get<WeeklySoutenanceSummary[]>(url);
  }

  listForDoctorant(doctorantId: string) {
    const query = `query SoutenancesDoctorant($doctorantId: ID!) {
      soutenancesForDoctorant(doctorantId: $doctorantId) {
        id
        doctorantId
        directeurId
        status
        titreTheseDefinitif
        resumeFinal
        motsCles
        publicationsCount
        communicationsCount
        heuresFormationCumulees
        dureeDoctoratAnnees
        manuscritPath
        rapportThesePath
        rapportAntiPlagiatPath
        attestationsFormationsPath
        demandeManuscritePath
        dateSoumission
        dateAutorisation
        datePlanifiee
      }
    }`;
    return this.execute<{ soutenancesForDoctorant: SoutenanceDTO[] }>(query, { doctorantId });
  }

  listForDirecteur(directeurId: string) {
    const query = `query SoutenancesDirecteur($directeurId: ID!) {
      soutenancesForDirecteur(directeurId: $directeurId) {
        id
        doctorantId
        directeurId
        status
        titreTheseDefinitif
        resumeFinal
        motsCles
        publicationsCount
        communicationsCount
        heuresFormationCumulees
        dureeDoctoratAnnees
        manuscritPath
        rapportThesePath
        rapportAntiPlagiatPath
        attestationsFormationsPath
        demandeManuscritePath
        dateSoumission
        dateAutorisation
        datePlanifiee
        salle
        lieu
      }
    }`;
    return this.execute<{ soutenancesForDirecteur: SoutenanceDTO[] }>(query, { directeurId });
  }

  listForAdmin(status?: SoutenanceStatus) {
    const query = `query SoutenancesAdmin($status: SoutenanceStatus) {
      soutenancesForAdmin(status: $status) {
        id
        doctorantId
        directeurId
        status
        titreTheseDefinitif
        resumeFinal
        motsCles
        publicationsCount
        communicationsCount
        heuresFormationCumulees
        dureeDoctoratAnnees
        manuscritPath
        rapportThesePath
        rapportAntiPlagiatPath
        attestationsFormationsPath
        demandeManuscritePath
        dateSoumission
        dateAutorisation
        datePlanifiee
        salle
        lieu
      }
    }`;
    return this.execute<{ soutenancesForAdmin: SoutenanceDTO[] }>(query, { status });
  }

  saveDraft(input: SoutenanceDraftInput) {
    const query = `mutation SaveDraft($input: SoutenanceDraftInput!) {
      saveSoutenanceDraft(input: $input) {
        id
        doctorantId
        directeurId
        status
        titreTheseDefinitif
        resumeFinal
        publicationsCount
        communicationsCount
        heuresFormationCumulees
        dureeDoctoratAnnees
        dateSoumission
      }
    }`;
    return this.execute<{ saveSoutenanceDraft: SoutenanceDTO }>(query, { input });
  }

  submit(id: string) {
    const query = `mutation SubmitSoutenance($id: ID!) {
      submitSoutenance(id: $id) {
        id
        status
        dateSoumission
      }
    }`;
    return this.execute<{ submitSoutenance: SoutenanceDTO }>(query, { id });
  }

  deleteDraft(id: string) {
    const query = `mutation DeleteSoutenanceDraft($id: ID!) {
      deleteSoutenanceDraft(id: $id)
    }`;
    return this.execute<{ deleteSoutenanceDraft: boolean }>(query, { id });
  }

  adminMarkPrerequisUnderReview(id: string) {
    const query = `mutation AdminMarkPrerequisUnderReview($id: ID!) {
      adminMarkPrerequisUnderReview(id: $id) {
        id
        status
      }
    }`;
    return this.execute<{ adminMarkPrerequisUnderReview: SoutenanceDTO }>(query, { id });
  }

  adminValidatePrerequis(id: string, commentaire?: string) {
    const query = `mutation AdminValidatePrerequis($id: ID!, $commentaire: String) {
      adminValidatePrerequis(id: $id, commentaire: $commentaire) {
        id
        status
      }
    }`;
    return this.execute<{ adminValidatePrerequis: SoutenanceDTO }>(query, { id, commentaire });
  }

  adminRejectSoutenance(id: string, motif: string) {
    const query = `mutation AdminRejectSoutenance($id: ID!, $motif: String!) {
      adminRejectSoutenance(id: $id, motif: $motif) {
        id
        status
      }
    }`;
    return this.execute<{ adminRejectSoutenance: SoutenanceDTO }>(query, { id, motif });
  }

  directeurProposeJury(id: string, membres: JuryMemberInput[]) {
    const query = `mutation DirecteurProposeJury($id: ID!, $membres: [JuryMemberInput!]!) {
      directeurProposeJury(id: $id, membres: $membres) {
        id
        status
      }
    }`;
    return this.execute<{ directeurProposeJury: SoutenanceDTO }>(query, { id, membres });
  }

  adminValidateJury(id: string, commentaire?: string) {
    const query = `mutation AdminValidateJury($id: ID!, $commentaire: String) {
      adminValidateJury(id: $id, commentaire: $commentaire) {
        id
        status
      }
    }`;
    return this.execute<{ adminValidateJury: SoutenanceDTO }>(query, { id, commentaire });
  }

  adminAuthorizeSoutenance(id: string) {
    const query = `mutation AdminAuthorizeSoutenance($id: ID!) {
      adminAuthorizeSoutenance(id: $id) {
        id
        status
        dateAutorisation
      }
    }`;
    return this.execute<{ adminAuthorizeSoutenance: SoutenanceDTO }>(query, { id });
  }

  directeurPlanifySoutenance(id: string, input: PlanificationInput) {
    const query = `mutation DirecteurPlanifySoutenance($id: ID!, $input: PlanificationInput!) {
      directeurProposePlanification(id: $id, input: $input) {
        id
        status
        datePlanifiee
        salle
        lieu
      }
    }`;
    return this.execute<{ directeurProposePlanification: SoutenanceDTO }>(query, { id, input });
  }

  adminPlanifySoutenance(id: string, input: PlanificationInput) {
    const query = `mutation AdminPlanifySoutenance($id: ID!, $input: PlanificationInput!) {
      adminPlanifySoutenance(id: $id, input: $input) {
        id
        status
        datePlanifiee
        salle
        lieu
      }
    }`;
    return this.execute<{ adminPlanifySoutenance: SoutenanceDTO }>(query, { id, input });
  }

  loadJury(soutenanceId: string) {
    const query = `query JuryForSoutenance($soutenanceId: String!) {
      juryForSoutenance(soutenanceId: $soutenanceId) {
        nom
        prenom
        affiliation
        email
        telephone
        role
      }
    }`;
    return this.execute<{ juryForSoutenance: JuryMemberInput[] }>(query, { soutenanceId });
  }

  adminMarkSoutenanceDone(id: string, dateEffective?: string) {
    const query = `mutation AdminMarkSoutenanceDone($id: ID!, $dateEffective: String) {
      adminMarkSoutenanceDone(id: $id, dateEffective: $dateEffective) {
        id
        status
      }
    }`;
    return this.execute<{ adminMarkSoutenanceDone: SoutenanceDTO }>(query, { id, dateEffective });
  }

  uploadAttachments(id: string, formData: FormData) {
    const url = `/soutenance/soutenances/${encodeURIComponent(id)}/attachments`;
    return this.api.post<SoutenanceDTO>(url, formData);
  }

  listAttachments(id: string) {
    const url = `/soutenance/soutenances/${encodeURIComponent(id)}/attachments`;
    return this.api.get<string[]>(url);
  }

  downloadAutorisation(id: string) {
    const url = `/soutenance/soutenances/${encodeURIComponent(id)}/autorisation.pdf`;
    return this.api.getBlob(url);
  }

  downloadProcesVerbal(id: string) {
    const url = `/soutenance/soutenances/${encodeURIComponent(id)}/proces-verbal.pdf`;
    return this.api.getBlob(url);
  }

  downloadAttachment(id: string, fileName: string) {
    const url = `/soutenance/soutenances/${encodeURIComponent(id)}/attachments/${encodeURIComponent(fileName)}`;
    return this.api.getBlob(url);
  }
}

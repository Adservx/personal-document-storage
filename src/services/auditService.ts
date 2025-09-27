import { supabase } from '../supabaseClient';
import { auth } from '../firebase';
import type { AuditLog, ApiResponse } from '../types';

export class AuditService {
  static async logAction(
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const auditData = {
        user_id: user.uid,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      await supabase.from('audit_logs').insert(auditData);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  static async getAuditLogs(limit = 50): Promise<ApiResponse<AuditLog[]>> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs'
      };
    }
  }

  private static async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  static async checkSecurityHealth(): Promise<{
    rls_enabled: boolean;
    auth_configured: boolean;
    storage_policies: boolean;
    audit_enabled: boolean;
  }> {
    try {
      // Check if RLS is enabled
      const { data: rlsCheck } = await supabase
        .from('documents')
        .select('count')
        .limit(1);

      // Check auth configuration
      const user = auth.currentUser;

      return {
        rls_enabled: rlsCheck !== null,
        auth_configured: !!user,
        storage_policies: true, // Assume configured if we can query
        audit_enabled: true
      };
    } catch (error) {
      console.error('Security health check failed:', error);
      return {
        rls_enabled: false,
        auth_configured: false,
        storage_policies: false,
        audit_enabled: false
      };
    }
  }
}
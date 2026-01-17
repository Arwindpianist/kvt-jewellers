"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CheckCircle2, AlertCircle, Users, Mail, Phone, Globe, Loader2 } from "lucide-react";

interface PreRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: "pending" | "converted";
  created_at: string;
}

export function PreRegistrationsManagement() {
  const [registrations, setRegistrations] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [converting, setConverting] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/admin/trading/pre-registrations");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAll = async () => {
    setConverting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/trading/convert-pre-registrations", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert registrations");
      }

      setSuccess(`Successfully converted ${data.converted} pre-registration(s) to registered members.`);
      setShowConvertDialog(false);
      fetchRegistrations();
    } catch (err: any) {
      setError(err.message || "Failed to convert registrations");
    } finally {
      setConverting(false);
    }
  };

  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const convertedCount = registrations.filter((r) => r.status === "converted").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pre-Registrations</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
              <Users className="h-8 w-8 text-brand-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold">{convertedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Convert All Button */}
      {pendingCount > 0 && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-brand-700">Ready to Launch?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Convert all {pendingCount} pending pre-registration(s) to registered members and notify them of the launch.
                </p>
              </div>
              <Button
                onClick={() => setShowConvertDialog(true)}
                className="gold-gradient-button"
                disabled={converting}
              >
                {converting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Convert All & Notify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Registrations Table */}
      <Card>
        <CardContent className="pt-6">
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pre-registrations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <TableCell className="font-medium">{reg.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {reg.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {reg.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {reg.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={reg.status === "converted" ? "default" : "secondary"}
                        >
                          {reg.status === "converted" ? "Converted" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert Dialog */}
      <ConfirmDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        title="Convert Pre-Registrations to Members"
        description={`This will convert all ${pendingCount} pending pre-registration(s) to registered members and send them launch notification emails. This action cannot be undone.`}
        confirmText="Convert & Notify"
        onConfirm={handleConvertAll}
      />
    </div>
  );
}

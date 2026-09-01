import { useState } from 'react';
import { motion } from 'motion/react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { UploadArea } from './components/UploadArea';
import { FindingsTable } from './components/FindingsTable';
import { DisputeLetterModal } from './components/DisputeLetterModal';
import { PipelineTraceModal } from './components/PipelineTraceModal';
import { LeaseClauseModal } from './components/LeaseClauseModal';
import { SAMPLE_FINDINGS, WESTSIDE_SAMPLE, SAMPLE_PIPELINE_LOGS } from './sampleFindings';
import { processUserAudit } from './utils/auditEngine';
import type { UploadedFile, Finding, PipelineLog } from './types';
import { Play, Sparkles, FileText, Receipt, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export function App() {
  const [leaseFile, setLeaseFile] = useState<UploadedFile | null>(null);
  const [billFiles, setBillFiles] = useState<UploadedFile[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [traceLogs, setTraceLogs] = useState<PipelineLog[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDisputeFinding, setSelectedDisputeFinding] = useState<Finding | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isLeaseRulesModalOpen, setIsLeaseRulesModalOpen] = useState(false);
  const [auditNotification, setAuditNotification] = useState<string | null>(null);

  // Load sample dataset into file state and process (DEMO MODE)
  const handleLoadPreset = async () => {
    const mockLease: UploadedFile = {
      file: new File([WESTSIDE_SAMPLE.leaseContent], WESTSIDE_SAMPLE.leaseFileName, { type: 'text/plain' }),
      name: WESTSIDE_SAMPLE.leaseFileName,
      content: WESTSIDE_SAMPLE.leaseContent,
      size: 2019
    };

    const mockBills: UploadedFile[] = WESTSIDE_SAMPLE.billFiles.map((b) => ({
      file: new File([b.content], b.name, { type: 'text/plain' }),
      name: b.name,
      content: b.content,
      size: b.name.includes('may') ? 1515 : 1196
    }));

    setLeaseFile(mockLease);
    setBillFiles(mockBills);

    setIsRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setFindings(SAMPLE_FINDINGS);
    setTraceLogs(SAMPLE_PIPELINE_LOGS);
    setIsRunning(false);

    setAuditNotification('Loaded & Analyzed Sample Demo Dataset (Westside Centre Lease + 3 Statements)');
    setTimeout(() => setAuditNotification(null), 4000);
  };

  // Run dynamic audit on real user uploaded files (REAL USER DATA MODE)
  const handleRunAudit = async () => {
    if (!leaseFile && billFiles.length === 0) {
      setAuditNotification('Please upload a lease agreement or at least one operating statement bill.');
      return;
    }

    setIsRunning(true);
    setSelectedIndex(null);

    // Execute dynamic user file audit algorithm
    const userFindings = await processUserAudit(leaseFile, billFiles);
    setFindings(userFindings);

    // Extract execution logs from first finding if available
    if (userFindings.length > 0 && userFindings[0].executionLogs) {
      setTraceLogs(userFindings[0].executionLogs);
    }

    setIsRunning(false);

    const totalOvercharge = userFindings.reduce((acc, f) => acc + (f.amount_at_risk_num || 0), 0);
    const reviewCount = userFindings.filter((f) => f.status === 'needs_review').length;

    if (totalOvercharge > 0) {
      setAuditNotification(
        `User Data Audit Complete! Flagged $${totalOvercharge.toLocaleString(undefined, { minimumFractionDigits: 2 })} in potential prohibited overcharges across ${userFindings.length} statement(s).`
      );
    } else if (reviewCount > 0) {
      setAuditNotification(`User Data Audit Complete! ${reviewCount} statement(s) require manual ledger review.`);
    } else {
      setAuditNotification(`User Data Audit Complete! All ${userFindings.length} user statements verified compliant.`);
    }

    setTimeout(() => setAuditNotification(null), 5000);
  };

  const handleResetData = () => {
    setLeaseFile(null);
    setBillFiles([]);
    setFindings([]);
    setTraceLogs([]);
    setSelectedIndex(null);
    setAuditNotification('Cleared user files and findings. Ready for new document upload.');
    setTimeout(() => setAuditNotification(null), 3000);
  };

  const handleOpenDisputeLetter = (finding: Finding) => {
    setSelectedDisputeFinding(finding);
    setIsDisputeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Header */}
        <Header
          onLoadPreset={handleLoadPreset}
          onOpenTrace={() => setIsTraceModalOpen(true)}
          onOpenLeaseRules={() => setIsLeaseRulesModalOpen(true)}
          isProcessing={isRunning}
        />

        {/* Audit Status Notification Banner */}
        {auditNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 text-sm font-semibold flex items-center justify-between shadow-lg glow-indigo"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>{auditNotification}</span>
            </div>
            <button
              onClick={() => setAuditNotification(null)}
              className="text-xs text-indigo-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* KPI Metric Summary Cards */}
        <MetricCards findings={findings} />

        {/* Upload & User File Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Lease Summary Dropzone */}
          <div className="lg:col-span-5">
            <UploadArea
              label="1. User Lease Agreement / Summary"
              icon={<FileText className="w-4 h-4 text-indigo-400" />}
              files={leaseFile ? [leaseFile] : []}
              onFilesChange={(files) => setLeaseFile(files[0] || null)}
              accept=".txt,.pdf,.docx,.json,.md"
              maxFiles={1}
            />
          </div>

          {/* Operating Bills Dropzone */}
          <div className="lg:col-span-7">
            <UploadArea
              label="2. User Operating Expense Statements"
              icon={<Receipt className="w-4 h-4 text-indigo-400" />}
              files={billFiles}
              onFilesChange={(files) => setBillFiles(files)}
              accept=".txt,.pdf,.docx,.xlsx,.xls,.csv,.json"
              maxFiles={5}
            />
          </div>
        </div>

        {/* Run Audit Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl glass-panel border border-slate-800 gap-4 mb-8 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Execute User File Audit Engine</h3>
              <p className="text-xs text-slate-400">
                {leaseFile || billFiles.length > 0
                  ? `Ready to parse ${leaseFile ? leaseFile.name : 'extracted lease rules'} and evaluate ${billFiles.length} operating statement(s)`
                  : 'Upload user lease and bill statements above or click Load Sample Data to begin.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(leaseFile || billFiles.length > 0 || findings.length > 0) && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResetData}
                disabled={isRunning}
                className="px-4 py-3.5 rounded-2xl text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px -5px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRunAudit}
              disabled={isRunning || (!leaseFile && billFiles.length === 0)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing User Files...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Audit User Data</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* User Audit Findings Results Table */}
        <FindingsTable
          findings={findings}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onOpenDisputeLetter={handleOpenDisputeLetter}
          isLoading={isRunning}
        />

        {/* Dispute Letter Modal */}
        <DisputeLetterModal
          finding={selectedDisputeFinding}
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
        />

        {/* Client Execution Pipeline Trace Modal */}
        <PipelineTraceModal
          isOpen={isTraceModalOpen}
          onClose={() => setIsTraceModalOpen(false)}
          logs={traceLogs}
        />

        {/* Lease Provisions Reference Modal */}
        <LeaseClauseModal
          isOpen={isLeaseRulesModalOpen}
          onClose={() => setIsLeaseRulesModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
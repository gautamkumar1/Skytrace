import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { submitAnalysis } from '../api/endpoints';
import { detectAircraftInfo } from '../utils/aircraftLookup';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import PageHeader from '../components/PageHeader';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Images } from '../assets';

interface PickedFile { uri: string; name: string; type: string; size: number }

export default function UploadScreen() {
  const [caseId, setCaseId] = useState('');
  const [registration, setRegistration] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [engineType, setEngineType] = useState('');
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const detect = useCallback((cid: string, reg: string, fnames: string[]) => {
    const info = detectAircraftInfo(cid, reg, ...fnames);
    if (info.aircraftType && !aircraftType) setAircraftType(info.aircraftType);
    if (info.engineType && !engineType) setEngineType(info.engineType);
  }, [aircraftType, engineType]);

  const pickFiles = async () => {
    try {
      const res = await pick({
        allowMultiSelection: true,
        type: [types.pdf, types.plainText, types.csv, types.docx, types.xlsx],
      });
      const picked: PickedFile[] = res.map(r => ({
        uri: r.uri,
        name: r.name ?? 'file',
        type: r.type ?? 'application/octet-stream',
        size: r.size ?? 0,
      }));
      setFiles(prev => [...prev, ...picked]);
      detect(caseId, registration, picked.map(f => f.name));
    } catch (e: any) {
      if (e?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', e.message);
    }
  };

  const submit = async () => {
    if (!caseId.trim() || !registration.trim()) {
      Alert.alert('Required', 'Case ID and Registration required');
      return;
    }
    if (!files.length) {
      Alert.alert('Required', 'Select at least one file');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const r = await submitAnalysis(
        caseId.trim(), registration.trim(), aircraftType, engineType, files,
      );
      setResult({ ok: true, msg: r.output || 'Analysis complete' });
    } catch (e: any) {
      setResult({ ok: false, msg: e.message });
    }
    setSubmitting(false);
  };

  const can = caseId.trim() && registration.trim() && files.length > 0 && !submitting;

  return (
    <ScrollView
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <PageHeader title="Upload" subtitle="Ingest documents for AI analysis" />

      <View style={styles.form}>
        {/* Case ID */}
        <AnimatedCard delay={80}>
          <Text style={[T.label, styles.label]}>CASE ID</Text>
          <TextInput
            style={styles.input}
            value={caseId}
            onChangeText={v => { setCaseId(v); detect(v, registration, files.map(f => f.name)); }}
            placeholder="CASE-2026-001"
            placeholderTextColor={C.t4}
            autoCapitalize="characters"
          />
        </AnimatedCard>

        {/* Registration */}
        <AnimatedCard delay={160}>
          <Text style={[T.label, styles.label]}>REGISTRATION</Text>
          <TextInput
            style={styles.input}
            value={registration}
            onChangeText={v => { setRegistration(v); detect(caseId, v, files.map(f => f.name)); }}
            placeholder="EI-ABC"
            placeholderTextColor={C.t4}
            autoCapitalize="characters"
          />
        </AnimatedCard>

        {/* Aircraft / Engine type row */}
        <AnimatedCard delay={240}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[T.label, styles.label]}>AIRCRAFT TYPE</Text>
              <TextInput
                style={styles.input}
                value={aircraftType}
                onChangeText={setAircraftType}
                placeholder="Auto"
                placeholderTextColor={C.t4}
              />
            </View>
            <View style={{ width: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={[T.label, styles.label]}>ENGINE TYPE</Text>
              <TextInput
                style={styles.input}
                value={engineType}
                onChangeText={setEngineType}
                placeholder="Auto"
                placeholderTextColor={C.t4}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* File dropzone */}
        <AnimatedCard delay={320}>
          <Text style={[T.label, styles.label]}>DOCUMENTS</Text>
          <AnimatedButton onPress={pickFiles}>
            <View style={styles.dropzone}>
              <Text style={styles.dropPlus}>+</Text>
              <Text style={[T.bold, { color: C.blue, marginTop: 4 }]}>Select Files</Text>
              <Text style={[T.cap, { color: C.t3, marginTop: 2 }]}>
                PDF, DOCX, XLSX, TXT, CSV
              </Text>
            </View>
          </AnimatedButton>
        </AnimatedCard>

        {/* File list */}
        {files.map((f, i) => (
          <AnimatedCard key={i} delay={360 + i * 50}>
            <View style={styles.fileRow}>
              <View style={styles.fileIcon}>
                <Text style={styles.fileExt}>
                  {f.name.split('.').pop()?.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[T.bold, { fontSize: 14 }]} numberOfLines={1}>
                  {f.name}
                </Text>
                <Text style={[T.cap, { color: C.t3 }]}>
                  {(f.size / 1024).toFixed(0)} KB
                </Text>
              </View>
              <AnimatedButton onPress={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                <Text style={[T.capBold, { color: C.red }]}>Remove</Text>
              </AnimatedButton>
            </View>
          </AnimatedCard>
        ))}

        {/* Submit */}
        <AnimatedCard delay={400}>
          <AnimatedButton onPress={submit} disabled={!can}>
            <View style={[styles.submitBtn, !can && { opacity: 0.4 }]}>
              {submitting ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={[T.bold, { color: C.white }]}>Start Analysis</Text>
              )}
            </View>
          </AnimatedButton>
        </AnimatedCard>

        {/* Result */}
        {result && (
          <AnimatedCard delay={0}>
            <View
              style={[
                styles.resultBox,
                { borderLeftColor: result.ok ? C.green : C.red },
              ]}
            >
              <Text style={[T.bold, { marginBottom: 4 }]}>
                {result.ok ? 'Complete' : 'Failed'}
              </Text>
              <Text style={[T.body, { color: C.t2 }]}>{result.msg}</Text>
            </View>
          </AnimatedCard>
        )}
      </View>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: Spacing.xxl,
  },
  sub: {
    ...T.body,
    color: C.t3,
    marginTop: 2,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
  },
  input: {
    backgroundColor: C.bgInput,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...T.body,
    color: C.t1,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
  },
  dropzone: {
    backgroundColor: C.bgInput,
    borderWidth: 1.5,
    borderColor: C.blue,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  dropPlus: {
    fontSize: 28,
    color: C.blue,
    fontWeight: '300',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: C.bgGlass,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: C.blueGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileExt: {
    ...T.tiny,
    color: C.blue,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: C.blue,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  resultBox: {
    backgroundColor: C.bgGlass,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
});

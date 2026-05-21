import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('=== Starting Phase 3D Supabase Invoices Verification ===\n');

  // 1. Read environment variables from .env.local
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found at project root.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
    return match ? match[1].trim().replace(/['"]/g, '') : null;
  };

  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  console.log(`Supabase URL loaded: ${supabaseUrl}`);

  // Create client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const emailA = `test_user_a_${Date.now()}@bizpilot.test`;
  const emailB = `test_user_b_${Date.now()}@bizpilot.test`;
  const password = 'TestSecurePassword123!';

  let sessionA = null;
  let sessionB = null;

  try {
    // ----------------------------------------------------
    // TEST 1: User Sign Up & Auth
    // ----------------------------------------------------
    console.log('\n[TEST 1] Creating Test User A and User B...');
    
    const { data: signUpA, error: signUpErrorA } = await supabase.auth.signUp({
      email: emailA,
      password: password,
      options: { data: { name: 'User A' } }
    });

    if (signUpErrorA) throw new Error(`User A signup failed: ${signUpErrorA.message}`);
    console.log(`✓ User A created: ${emailA}`);

    const { data: signUpB, error: signUpErrorB } = await supabase.auth.signUp({
      email: emailB,
      password: password,
      options: { data: { name: 'User B' } }
    });

    if (signUpErrorB) throw new Error(`User B signup failed: ${signUpErrorB.message}`);
    console.log(`✓ User B created: ${emailB}`);

    // Sign in as User A
    const { data: signInA, error: signInErrorA } = await supabase.auth.signInWithPassword({
      email: emailA,
      password: password
    });
    if (signInErrorA) throw new Error(`User A login failed: ${signInErrorA.message}`);
    sessionA = signInA.session;
    console.log('✓ Logged in as User A.');

    // ----------------------------------------------------
    // TEST 2: Add Invoice (Create)
    // ----------------------------------------------------
    console.log('\n[TEST 2] Testing Create Invoice for User A...');
    const clientA = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });

    const newInvoice = {
      invoice_number: 'INV-2026-TEST01',
      lead_name: 'Jane Doe',
      lead_phone: '+919999988888',
      service: 'JEE Demo Coaching',
      amount: 15000.00,
      status: 'unpaid',
      due_date: '2026-06-01',
      notes: 'Initial test invoice notes',
      user_id: sessionA.user.id
    };

    const { data: createdInvoice, error: createError } = await clientA
      .from('invoices')
      .insert([newInvoice])
      .select()
      .single();

    if (createError) throw new Error(`Failed to create invoice: ${createError.message}`);
    console.log(`✓ Invoice created successfully with ID: ${createdInvoice.id}`);
    console.log(`  Number: ${createdInvoice.invoice_number}, Client: ${createdInvoice.lead_name}, Amount: ${createdInvoice.amount}`);

    // ----------------------------------------------------
    // TEST 3: Fetch Invoices (Read)
    // ----------------------------------------------------
    console.log('\n[TEST 3] Testing Fetch Invoices for User A...');
    const { data: fetchedInvoices, error: fetchError } = await clientA
      .from('invoices')
      .select('*');

    if (fetchError) throw new Error(`Failed to fetch invoices: ${fetchError.message}`);
    console.log(`✓ Fetched ${fetchedInvoices.length} invoices for User A.`);
    
    // Verify the invoice is in the list
    const found = fetchedInvoices.find(inv => inv.id === createdInvoice.id);
    if (!found) throw new Error('Created invoice was not found in the fetched list!');
    console.log('✓ Found created invoice in list.');

    // ----------------------------------------------------
    // TEST 4: Edit Invoice & Update Status (Update)
    // ----------------------------------------------------
    console.log('\n[TEST 4] Testing Edit Invoice & Status (pending -> paid -> unpaid)...');
    
    // Edit details (notes, amount)
    const { data: updatedInvoice1, error: updateError1 } = await clientA
      .from('invoices')
      .update({ notes: 'Updated notes', amount: 16000.00 })
      .eq('id', createdInvoice.id)
      .select()
      .single();

    if (updateError1) throw new Error(`Failed to update invoice details: ${updateError1.message}`);
    if (updatedInvoice1.notes !== 'Updated notes' || Number(updatedInvoice1.amount) !== 16000.00) {
      throw new Error('Updated details check failed!');
    }
    console.log('✓ Invoice details edited successfully.');

    // Update status to pending (simulated as unpaid with pending notes or just changing status)
    // Wait, the InvoiceStatus type has: 'paid' | 'unpaid' | 'overdue'.
    // Let's test 'paid' and 'overdue' and 'unpaid'
    const statusesToTest = ['paid', 'overdue', 'unpaid'];
    for (const testStatus of statusesToTest) {
      console.log(`  Changing status to: ${testStatus}...`);
      const { data: updatedStatus, error: statusError } = await clientA
        .from('invoices')
        .update({ status: testStatus })
        .eq('id', createdInvoice.id)
        .select()
        .single();

      if (statusError) throw new Error(`Failed to update status to ${testStatus}: ${statusError.message}`);
      if (updatedStatus.status !== testStatus) throw new Error(`Status did not update to ${testStatus}!`);
      console.log(`  ✓ Status updated to ${testStatus} successfully.`);
    }

    // ----------------------------------------------------
    // TEST 5: Confirm RLS Policies (Isolation)
    // ----------------------------------------------------
    console.log('\n[TEST 5] Testing RLS Policy Isolation...');
    
    // Sign in as User B
    const { data: signInB, error: signInErrorB } = await supabase.auth.signInWithPassword({
      email: emailB,
      password: password
    });
    if (signInErrorB) throw new Error(`User B login failed: ${signInErrorB.message}`);
    sessionB = signInB.session;
    console.log('✓ Logged in as User B.');

    const clientB = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
    });

    // Try to fetch User A's invoice directly
    const { data: singleInvoiceB, error: fetchInvoiceErrorB } = await clientB
      .from('invoices')
      .select('*')
      .eq('id', createdInvoice.id);

    console.log(`  Attempting to read User A's invoice as User B...`);
    if (singleInvoiceB && singleInvoiceB.length > 0) {
      throw new Error('RLS FAILURE: User B was able to read User A\'s invoice!');
    }
    console.log('✓ RLS SELECT protection active: User B fetched 0 results for User A\'s invoice.');

    // Try to update User A's invoice as User B
    console.log(`  Attempting to update User A's invoice as User B...`);
    const { data: updateInvoiceB, error: updateInvoiceErrorB } = await clientB
      .from('invoices')
      .update({ lead_name: 'Hacked by User B' })
      .eq('id', createdInvoice.id)
      .select();

    if (updateInvoiceB && updateInvoiceB.length > 0) {
      throw new Error('RLS FAILURE: User B was able to update User A\'s invoice!');
    }
    console.log('✓ RLS UPDATE protection active: User B was blocked from updating User A\'s invoice.');

    // Try to delete User A's invoice as User B
    console.log(`  Attempting to delete User A's invoice as User B...`);
    const { error: deleteInvoiceErrorB } = await clientB
      .from('invoices')
      .delete()
      .eq('id', createdInvoice.id);

    // Confirm invoice still exists for User A
    const { data: checkInvoiceA, error: checkInvoiceErrorA } = await clientA
      .from('invoices')
      .select('*')
      .eq('id', createdInvoice.id);

    if (!checkInvoiceA || checkInvoiceA.length === 0) {
      throw new Error('RLS FAILURE: User B was able to delete User A\'s invoice!');
    }
    console.log('✓ RLS DELETE protection active: User B was blocked from deleting User A\'s invoice.');

    // ----------------------------------------------------
    // TEST 6: Delete Invoice (Delete)
    // ----------------------------------------------------
    console.log('\n[TEST 6] Testing Delete Invoice for User A...');
    const { error: deleteError } = await clientA
      .from('invoices')
      .delete()
      .eq('id', createdInvoice.id);

    if (deleteError) throw new Error(`Delete call failed: ${deleteError.message}`);

    const { data: checkDeleted, error: checkDeletedError } = await clientA
      .from('invoices')
      .select('*')
      .eq('id', createdInvoice.id);

    if (checkDeleted && checkDeleted.length > 0) {
      throw new Error('Invoice still exists after calling delete!');
    }
    console.log('✓ Invoice deleted successfully.');

    // ----------------------------------------------------
    // TEST 7: Confirm Leads CRM and Appointments Still Work
    // ----------------------------------------------------
    console.log('\n[TEST 7] Testing if Leads CRM and Appointments tables are readable...');
    
    const { data: testLeads, error: leadsError } = await clientA.from('leads').select('*');
    if (leadsError) throw new Error(`Leads table read failed: ${leadsError.message}`);
    console.log(`✓ Leads CRM is still functioning (readable, returned ${testLeads.length} items).`);

    const { data: testAppts, error: apptsError } = await clientA.from('appointments').select('*');
    if (apptsError) throw new Error(`Appointments table read failed: ${apptsError.message}`);
    console.log(`✓ Appointments is still functioning (readable, returned ${testAppts.length} items).`);

    console.log('\n=== All Phase 3D Invoices Tests Passed Successfully! 🎉 ===');

  } catch (error) {
    console.error('\n❌ Test Failure:', error.message);
    process.exit(1);
  } finally {
    // Attempt cleaning up users
    console.log('\nCleaning up test sessions...');
    if (sessionA) {
      await supabase.auth.signOut();
    }
    console.log('Done.');
  }
}

runTests();

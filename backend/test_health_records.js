import pool from './config/database.js';

// Helper to get cookies from Response header
function getCookie(res) {
    return res.headers.get("set-cookie");
}

async function runTests() {
    try {
        console.log("=== HEALTH RECORDS & ROUTINES INTEGRATION TESTS ===");

        // 1. Clean up test data
        console.log("1. Cleaning up test data...");
        await pool.query("DELETE FROM users.patients WHERE identity = '8888888888888'");
        await pool.query("DELETE FROM users.community_health_workers WHERE identity = '7777777777777'");
        await pool.query("DELETE FROM users.user_profiles WHERE identity = '1111111111111'");
        await pool.query("DELETE FROM users.user_profiles WHERE identity = '2222222222222'");
        console.log("Cleanup done.");

        // 2. Register and Login Admin
        console.log("2. Registering & Logging in Admin...");
        const registerAdminRes = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "UbuntuAdmin",
                identity: "1111111111111",
                phone_number: "0823456789",
                email: "admin@ubuntus.org",
                password: "Password123",
                role: "admin",
                organization: "Cape Town Clinic",
                facility_code: "FAC-999"
            })
        });
        if (!registerAdminRes.ok) throw new Error("Admin registration failed");

        const loginAdminRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identity: "1111111111111",
                password: "Password123"
            })
        });
        const adminCookie = getCookie(loginAdminRes);
        console.log("Admin cookie obtained.");

        // 3. Register and Login CHW
        console.log("3. Registering CHW...");
        const registerChwRes = await fetch("http://localhost:5000/api/chw", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                employee_id: "CHW-TEST-99",
                fullname: "Test CHW",
                identity: "7777777777777",
                password: "ChwPassword123",
                phone_number: "0729999999",
                email: "chw@ubuntus.org"
            })
        });
        const chwData = await registerChwRes.json();
        const chwId = chwData.chw.id;
        console.log(`CHW registered. ID: ${chwId}`);

        const loginChwRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identity: "7777777777777",
                password: "ChwPassword123"
            })
        });
        const chwCookie = getCookie(loginChwRes);
        console.log("CHW cookie obtained.");

        // 4. Register Patient (unassigned CHW initially)
        console.log("4. Registering Patient...");
        const registerPatientRes = await fetch("http://localhost:5000/api/patients", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                fullname: "Patient Test",
                identity: "8888888888888",
                gender: "Female",
                password: "PatientPassword123",
                email: "patient@ubuntus.org",
                phone_number: "0819999999",
                diagnosis: "Hypertension Type 2",
                house_number: "14B Block C",
                surbub: "Khayelitsha",
                municipality: "City of Cape Town",
                city: "Cape Town",
                nok_fullname: "Kin Test",
                nok_phone: "0829999999",
                nok_email: "nok@ubuntus.org",
                chw_id: null
            })
        });
        const patientData = await registerPatientRes.json();
        const patientId = patientData.patient.id;
        console.log(`Patient registered. ID: ${patientId}`);

        const loginPatientRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identity: "8888888888888",
                password: "PatientPassword123"
            })
        });
        const patientCookie = getCookie(loginPatientRes);
        console.log("Patient cookie obtained.");

        // 5. Verify default record and routine creation
        console.log("5. Verifying default record and routine creation...");
        const recordsRes = await fetch(`http://localhost:5000/api/records/${patientId}`, {
            headers: { "Cookie": adminCookie }
        });
        const recordsData = await recordsRes.json();
        console.log(`Fetch status: ${recordsRes.status}`);
        console.log(`Default record found: ${recordsData.records?.length > 0}`);
        console.log(`Default routine found: ${recordsData.routines?.length > 0}`);
        if (!recordsData.records?.length || !recordsData.routines?.length) {
            throw new Error("Default record or routine missing!");
        }
        const defaultRecordId = recordsData.records[0].id;

        // 6. Access Control Checks
        console.log("6. Testing access controls...");
        // A. Patient accessing own files -> Should succeed
        const patientAccessRes = await fetch(`http://localhost:5000/api/records/${patientId}`, {
            headers: { "Cookie": patientCookie }
        });
        console.log(`Patient accessing own files: status ${patientAccessRes.status} (Expected: 200)`);
        if (patientAccessRes.status !== 200) throw new Error("Patient access denied to own records");

        // B. Admin accessing patient files -> Should succeed
        const adminAccessRes = await fetch(`http://localhost:5000/api/records/${patientId}`, {
            headers: { "Cookie": adminCookie }
        });
        console.log(`Admin accessing patient files: status ${adminAccessRes.status} (Expected: 200)`);
        if (adminAccessRes.status !== 200) throw new Error("Admin access denied to clinic patient");

        // C. CHW accessing patient files (unassigned) -> Should fail
        const chwAccessRes = await fetch(`http://localhost:5000/api/records/${patientId}`, {
            headers: { "Cookie": chwCookie }
        });
        console.log(`Unassigned CHW accessing patient: status ${chwAccessRes.status} (Expected: 403)`);
        if (chwAccessRes.status !== 403) throw new Error("Unassigned CHW allowed access!");

        // 7. Assign CHW to patient
        console.log("7. Assigning CHW to Patient...");
        const updatePatientRes = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                fullname: "Patient Test",
                identity: "8888888888888",
                gender: "Female",
                phone_number: "0819999999",
                diagnosis: "Hypertension Type 2",
                nok_fullname: "Kin Test",
                chw_id: chwId
            })
        });
        console.log(`Assign CHW update status: ${updatePatientRes.status} (Expected: 200)`);
        if (updatePatientRes.status !== 200) throw new Error("Failed to assign CHW to patient");

        // 8. Assigned CHW Access check
        console.log("8. Verifying assigned CHW access...");
        const chwAssignedAccessRes = await fetch(`http://localhost:5000/api/records/${patientId}`, {
            headers: { "Cookie": chwCookie }
        });
        console.log(`Assigned CHW accessing patient: status ${chwAssignedAccessRes.status} (Expected: 200)`);
        if (chwAssignedAccessRes.status !== 200) throw new Error("Assigned CHW denied access to patient records");

        // 9. Update health record with verification validation
        console.log("9. Testing edit validation logic...");
        // A. Wrong name/identity verification -> Should fail
        const editFailRes = await fetch(`http://localhost:5000/api/records/${defaultRecordId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                patient_name: "Wrong Name",
                patient_identity: "8888888888888",
                blood_group: "O+"
            })
        });
        console.log(`Edit with wrong verification name: status ${editFailRes.status} (Expected: 400)`);
        if (editFailRes.status !== 400) throw new Error("Edit allowed with wrong verification info");

        // B. Correct verification -> Should succeed
        const editSucceedRes = await fetch(`http://localhost:5000/api/records/${defaultRecordId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                patient_name: "Patient Test",
                patient_identity: "8888888888888",
                blood_group: "A+",
                weight: 68.5,
                height: 172.0,
                temperature: 36.6,
                blood_pressure: 120.0,
                heart_rate: 72.0,
                symptoms: "Mild fatigue",
                allergies: "Peanuts",
                diagnosis: "Hypertension Controlled",
                prescription: "Hydrochlorothiazide 25mg daily"
            })
        });
        console.log(`Edit with correct verification: status ${editSucceedRes.status} (Expected: 200)`);
        if (editSucceedRes.status !== 200) throw new Error("Edit failed with correct verification info");
        const editSucceedData = await editSucceedRes.json();
        console.log(`Updated Blood Group: ${editSucceedData.record.blood_group} (Expected: A+)`);
        if (editSucceedData.record.blood_group !== "A+") throw new Error("Record property update mismatch");

        // 10. Add and Edit Routines
        console.log("10. Testing routine schedule creation and validations...");
        // A. Add weekly routine on Wednesday -> Should succeed
        const addWeeklyRes = await fetch("http://localhost:5000/api/records/routines", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                record_id: defaultRecordId,
                routine_range: "weekly",
                routine_day: "Wednesday",
                description: "Weekly glucose check"
            })
        });
        console.log(`Add weekly Wednesday routine: status ${addWeeklyRes.status} (Expected: 201)`);
        if (addWeeklyRes.status !== 201) {
            const errBody = await addWeeklyRes.json();
            console.log("Error body:", errBody);
            throw new Error("Failed to create weekly routine");
        }
        const weeklyData = await addWeeklyRes.json();
        console.log(`Weekly calculated date: ${new Date(weeklyData.routine.date).toLocaleDateString()}`);

        // B. Add weekly routine on Saturday -> Should fail (weekdays only)
        const addWeeklyFailRes = await fetch("http://localhost:5000/api/records/routines", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                record_id: defaultRecordId,
                routine_range: "weekly",
                routine_day: "Saturday",
                description: "Weekend check"
            })
        });
        console.log(`Add weekly Saturday routine: status ${addWeeklyFailRes.status} (Expected: 400)`);
        if (addWeeklyFailRes.status !== 400) throw new Error("Allowed weekly routine on weekend!");

        // C. Add monthly routine on 15th -> Should succeed
        const addMonthlyRes = await fetch("http://localhost:5000/api/records/routines", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                record_id: defaultRecordId,
                routine_range: "monthly",
                routine_day: "15",
                description: "Monthly clinic check-in"
            })
        });
        console.log(`Add monthly routine: status ${addMonthlyRes.status} (Expected: 201)`);
        if (addMonthlyRes.status !== 201) throw new Error("Failed to create monthly routine");
        const monthlyData = await addMonthlyRes.json();
        console.log(`Monthly calculated date: ${new Date(monthlyData.routine.date).toLocaleDateString()}`);

        // D. Add monthly routine on 30th -> Should fail (1-28 only)
        const addMonthlyFailRes = await fetch("http://localhost:5000/api/records/routines", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                record_id: defaultRecordId,
                routine_range: "monthly",
                routine_day: "30",
                description: "Late monthly check"
            })
        });
        console.log(`Add monthly routine on 30th: status ${addMonthlyFailRes.status} (Expected: 400)`);
        if (addMonthlyFailRes.status !== 400) throw new Error("Allowed monthly routine on day 30!");

        // E. Mark weekly routine as attended without patient identity -> Should fail
        const markAttendedNoIdRes = await fetch(`http://localhost:5000/api/records/routines/${weeklyData.routine.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                routine_range: "weekly",
                routine_day: "Wednesday",
                description: "Weekly glucose check",
                attended: true
            })
        });
        console.log(`Mark attended without identity: status ${markAttendedNoIdRes.status} (Expected: 400)`);
        if (markAttendedNoIdRes.status !== 400) throw new Error("Allowed marking routine attended without identity!");

        // F. Mark weekly routine as attended with incorrect patient identity -> Should fail
        const markAttendedWrongIdRes = await fetch(`http://localhost:5000/api/records/routines/${weeklyData.routine.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                routine_range: "weekly",
                routine_day: "Wednesday",
                description: "Weekly glucose check",
                attended: true,
                patient_identity: "9999999999999"
            })
        });
        console.log(`Mark attended with wrong identity: status ${markAttendedWrongIdRes.status} (Expected: 400)`);
        if (markAttendedWrongIdRes.status !== 400) throw new Error("Allowed marking routine attended with wrong identity!");

        // G. Mark weekly routine as attended with correct patient identity -> Should succeed
        const markAttendedCorrectRes = await fetch(`http://localhost:5000/api/records/routines/${weeklyData.routine.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                routine_range: "weekly",
                routine_day: "Wednesday",
                description: "Weekly glucose check",
                attended: true,
                patient_identity: "8888888888888"
            })
        });
        console.log(`Mark attended with correct identity: status ${markAttendedCorrectRes.status} (Expected: 200)`);
        if (markAttendedCorrectRes.status !== 200) throw new Error("Failed to mark routine attended with correct identity!");

        // H. Attempt to edit routine that is already attended -> Should fail
        const editAttendedRes = await fetch(`http://localhost:5000/api/records/routines/${weeklyData.routine.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                routine_range: "weekly",
                routine_day: "Friday",
                description: "Edited weekly glucose check",
                attended: true
            })
        });
        console.log(`Edit attended routine status: ${editAttendedRes.status} (Expected: 400)`);
        if (editAttendedRes.status !== 400) throw new Error("Allowed editing an attended routine!");

        // I. Test Fulfill Appointment cancellation logic
        console.log("Testing fulfilled appointment cancellation protection...");
        const appointmentCreateRes = await fetch("http://localhost:5000/api/appointments", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": patientCookie
            },
            body: JSON.stringify({
                organization: "Cape Town Clinic",
                date_time: "2026-06-25",
                reason: "Routine Check"
            })
        });
        const appCreateData = await appointmentCreateRes.json();
        const appointmentId = appCreateData.appointment.id;
        const appKey = appCreateData.appointment.appointment_key;

        // Fulfill the appointment as admin
        const fulfillRes = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/fulfill`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({ appointment_key: appKey })
        });
        console.log(`Fulfill appointment status: ${fulfillRes.status} (Expected: 200)`);
        if (fulfillRes.status !== 200) throw new Error("Failed to fulfill appointment for testing");

        // Try to cancel the fulfilled appointment -> Should fail
        const cancelRes = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": patientCookie
            },
            body: JSON.stringify({ status: "cancelled" })
        });
        console.log(`Cancel fulfilled appointment status: ${cancelRes.status} (Expected: 400)`);
        if (cancelRes.status !== 400) throw new Error("Allowed cancelling a fulfilled appointment!");

        // J. Test Referrals Receiver lockout logic
        console.log("Testing referrals receiver edit/delete lockout...");
        const referralCreateRes = await fetch("http://localhost:5000/api/referrals", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                patient_id: patientId,
                organization_to: "Cape Town Clinic",
                department_to: "Cardiology",
                staff_to: "Dr. Lerato Sibanda",
                reason: "Heart check",
                arrival_date: "2026-06-25 10:00:00"
            })
        });
        const refData = await referralCreateRes.json();
        const referralId = refData.referral.id;

        // Try to edit the referral as receiver (Admin of Cape Town Clinic) -> Should fail with 403
        const editRefRes = await fetch(`http://localhost:5000/api/referrals/${referralId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                patient_id: patientId,
                organization_to: "Cape Town Clinic",
                department_to: "Neurology",
                staff_to: "Dr. Lerato Sibanda",
                reason: "Neuro check",
                arrival_date: "2026-06-25 10:00:00"
            })
        });
        console.log(`Edit referral as receiver status: ${editRefRes.status} (Expected: 403)`);
        if (editRefRes.status !== 403) throw new Error("Allowed receiver to edit the referral!");

        // Try to delete the referral as receiver (Admin of Cape Town Clinic) -> Should fail with 403
        const deleteRefRes = await fetch(`http://localhost:5000/api/referrals/${referralId}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            }
        });
        console.log(`Delete referral as receiver status: ${deleteRefRes.status} (Expected: 403)`);
        if (deleteRefRes.status !== 403) throw new Error("Allowed receiver to delete the referral!");

        // J1. Test Referral permissions and validation
        // Patient trying to create a referral -> Should fail (403)
        console.log("Testing patient referral creation block...");
        const patientReferralRes = await fetch("http://localhost:5000/api/referrals", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": patientCookie
            },
            body: JSON.stringify({
                patient_id: patientId,
                organization_to: "Cape Town Clinic",
                department_to: "Cardiology",
                staff_to: "Dr. Lerato Sibanda",
                reason: "Heart check",
                arrival_date: "2026-06-25 10:00:00"
            })
        });
        console.log(`Patient referral creation status: ${patientReferralRes.status} (Expected: 403)`);
        if (patientReferralRes.status !== 403) throw new Error("Allowed patient to create a referral!");

        // CHW creating a referral -> Should succeed (201)
        console.log("Testing CHW referral creation allowance...");
        const chwReferralRes = await fetch("http://localhost:5000/api/referrals", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": chwCookie
            },
            body: JSON.stringify({
                patient_id: patientId,
                organization_to: "Cape Town Clinic",
                department_to: "Cardiology",
                staff_to: "Dr. Lerato Sibanda",
                reason: "Heart check",
                arrival_date: "2026-06-25 10:00:00"
            })
        });
        console.log(`CHW referral creation status: ${chwReferralRes.status} (Expected: 201)`);
        if (chwReferralRes.status !== 201) throw new Error("CHW referral creation failed!");
        const chwRefData = await chwReferralRes.json();
        // Clean up
        await pool.query("DELETE FROM todos.referrals WHERE id = $1", [chwRefData.referral.id]);

        // Creating a referral with a past date -> Should fail (400)
        console.log("Testing referral arrival date validation (prevent past dates)...");
        const pastReferralRes = await fetch("http://localhost:5000/api/referrals", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({
                patient_id: patientId,
                organization_to: "Cape Town Clinic",
                department_to: "Cardiology",
                staff_to: "Dr. Lerato Sibanda",
                reason: "Heart check",
                arrival_date: "2020-01-01 10:00:00"
            })
        });
        console.log(`Past referral date status: ${pastReferralRes.status} (Expected: 400)`);
        if (pastReferralRes.status !== 400) throw new Error("Allowed referral with past arrival date!");

        // K. Test registration validations for admin and staff
        console.log("Testing registration validation rules...");
        
        // 1. Admin without facility_code -> Should fail (400)
        const registerAdminNoCode = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "NoCodeAdmin",
                identity: "2222222222222",
                phone_number: "0823456780",
                password: "Password123",
                role: "admin",
                organization: "Cape Town Clinic"
            })
        });
        console.log(`Register admin without facility code status: ${registerAdminNoCode.status} (Expected: 400)`);
        if (registerAdminNoCode.status !== 400) throw new Error("Admin registration allowed without facility code!");

        // 2. Staff without staff_number -> Should fail (400)
        const registerStaffNoNum = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "NoNumStaff",
                identity: "2222222222222",
                phone_number: "0823456780",
                password: "Password123",
                role: "staff",
                organization: "Cape Town Clinic",
                profession: "Doctor"
            })
        });
        console.log(`Register staff without staff number status: ${registerStaffNoNum.status} (Expected: 400)`);
        if (registerStaffNoNum.status !== 400) throw new Error("Staff registration allowed without staff number!");

        // 3. Staff without profession -> Should fail (400)
        const registerStaffNoProf = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "NoProfStaff",
                identity: "2222222222222",
                phone_number: "0823456780",
                password: "Password123",
                role: "staff",
                organization: "Cape Town Clinic",
                staff_number: "ST-888"
            })
        });
        console.log(`Register staff without profession status: ${registerStaffNoProf.status} (Expected: 400)`);
        if (registerStaffNoProf.status !== 400) throw new Error("Staff registration allowed without profession!");

        // 4. Staff with invalid profession -> Should fail (400)
        const registerStaffBadProf = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "BadProfStaff",
                identity: "2222222222222",
                phone_number: "0823456780",
                password: "Password123",
                role: "staff",
                organization: "Cape Town Clinic",
                staff_number: "ST-888",
                profession: "Developer"
            })
        });
        console.log(`Register staff with invalid profession status: ${registerStaffBadProf.status} (Expected: 400)`);
        if (registerStaffBadProf.status !== 400) throw new Error("Staff registration allowed with invalid profession!");

        // 5. Staff with valid details -> Should succeed (201)
        const registerStaffSuccess = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: "ValidStaff",
                identity: "2222222222222",
                phone_number: "0823456780",
                password: "Password123",
                role: "staff",
                organization: "Cape Town Clinic",
                staff_number: "ST-888",
                profession: "nurse"
            })
        });
        console.log(`Register staff with valid details status: ${registerStaffSuccess.status} (Expected: 201)`);
        if (registerStaffSuccess.status !== 201) throw new Error("Valid staff registration failed!");

        // 6. Test public caregivers endpoint
        console.log("Testing public caregivers endpoint...");
        const caregiversRes = await fetch("http://localhost:5000/api/appointments/public/caregivers?organization=Cape%20Town%20Clinic");
        console.log(`Public caregivers status: ${caregiversRes.status} (Expected: 200)`);
        if (caregiversRes.status !== 200) throw new Error("Failed to fetch public caregivers");
        const caregiversData = await caregiversRes.json();
        console.log(`Public caregivers list length: ${caregiversData.caregivers.length}`);
        const foundStaff = caregiversData.caregivers.find(c => c.fullname === "ValidStaff");
        if (!foundStaff) throw new Error("Expected to find registered caregiver in public list!");

        // 7. Test public appointment creation without visitor_name -> Should fail (400)
        console.log("Testing public appointment creation without visitor_name...");
        const bookNoNameRes = await fetch("http://localhost:5000/api/appointments/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                organization: "Cape Town Clinic",
                care_giver: foundStaff.id,
                reason: "Guest checkup",
                date_time: "2026-07-20T10:00:00",
                contact_email: "guest@example.com",
                contact_phone: "0714366053"
            })
        });
        console.log(`Book guest appointment without visitor_name status: ${bookNoNameRes.status} (Expected: 400)`);
        if (bookNoNameRes.status !== 400) throw new Error("Allowed guest appointment booking without visitor_name!");

        // 7.1. Test public appointment creation without contact details -> Should fail (400)
        console.log("Testing public appointment creation without contact details...");
        const bookNoContactRes = await fetch("http://localhost:5000/api/appointments/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitor_name: "Guest Joe",
                organization: "Cape Town Clinic",
                care_giver: foundStaff.id,
                reason: "Guest checkup",
                date_time: "2026-07-20T10:00:00"
            })
        });
        console.log(`Book guest appointment without contact status: ${bookNoContactRes.status} (Expected: 400)`);
        if (bookNoContactRes.status !== 400) throw new Error("Allowed guest appointment booking without contact info!");

        // 7.2. Book guest appointment with past date -> Should fail (400)
        console.log("Testing guest appointment date validation (prevent past dates)...");
        const pastGuestAppRes = await fetch("http://localhost:5000/api/appointments/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitor_name: "Guest Joe",
                organization: "Cape Town Clinic",
                care_giver: foundStaff.id,
                reason: "Guest checkup",
                date_time: "2020-01-01T10:00:00",
                contact_email: "guest@example.com",
                contact_phone: "0714366053"
            })
        });
        console.log(`Past guest appointment date status: ${pastGuestAppRes.status} (Expected: 400)`);
        if (pastGuestAppRes.status !== 400) throw new Error("Allowed guest appointment with past date!");

        // 8. Test public appointment creation with valid details -> Should succeed (201)
        console.log("Testing public appointment creation with valid details...");
        const bookSuccessRes = await fetch("http://localhost:5000/api/appointments/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitor_name: "Guest Joe",
                organization: "Cape Town Clinic",
                care_giver: foundStaff.id,
                reason: "Guest checkup",
                date_time: "2026-07-20T10:00:00",
                contact_email: "guest@example.com",
                contact_phone: "0714366053"
            })
        });
        console.log(`Book guest appointment with contact status: ${bookSuccessRes.status} (Expected: 201)`);
        if (bookSuccessRes.status !== 201) throw new Error("Guest appointment booking failed!");
        const bookData = await bookSuccessRes.json();
        const guestApp = bookData.appointment;
        if (!guestApp.appointment_key || guestApp.appointment_key.length !== 6) {
            throw new Error("Guest appointment missing or invalid verification key!");
        }
        if (guestApp.visitor_name !== 'Guest Joe') {
            throw new Error(`Expected visitor name to be 'Guest Joe', got: ${guestApp.visitor_name}`);
        }
        if (guestApp.care_giver_name !== 'ValidStaff') {
            throw new Error(`Expected caregiver name to be 'ValidStaff', got: ${guestApp.care_giver_name}`);
        }

        // 9. Test approving the guest appointment -> Should trigger SMS/Email logic (200)
        console.log("Testing guest appointment status approval notification flow...");
        const approveGuestRes = await fetch(`http://localhost:5000/api/appointments/${guestApp.id}/status`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": adminCookie
            },
            body: JSON.stringify({ status: "approved" })
        });
        console.log(`Approve guest appointment status: ${approveGuestRes.status} (Expected: 200)`);
        if (approveGuestRes.status !== 200) throw new Error("Failed to approve guest appointment!");

        // Clean up the guest appointment
        await pool.query("DELETE FROM todos.appointments WHERE id = $1", [guestApp.id]);
        console.log("Guest appointment booking and notification tests passed successfully.");

        // Clean up the registered staff user
        await pool.query("DELETE FROM users.user_profiles WHERE identity = '2222222222222'");

        console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===");

        // 11. Clean up test data
        console.log("11. Cleaning up test data...");
        await pool.query("DELETE FROM users.patients WHERE identity = '8888888888888'");
        await pool.query("DELETE FROM users.community_health_workers WHERE identity = '7777777777777'");
        await pool.query("DELETE FROM users.user_profiles WHERE identity = '1111111111111'");
        await pool.query("DELETE FROM users.user_profiles WHERE identity = '2222222222222'");
        console.log("Cleanup complete.");

    } catch (err) {
        console.error("Test failed with error:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runTests();

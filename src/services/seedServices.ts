import { supabase } from '../lib/supabase';

// All services for all industries
const allServicesData = {
  banking: [
    { name: 'Account Opening', description: 'Open a new bank account', estimated_time: 20 },
    { name: 'Loan Inquiry', description: 'Inquire about loan options', estimated_time: 25 },
    { name: 'Investment Consultation', description: 'Discuss investment opportunities', estimated_time: 30 },
    { name: 'Card Services', description: 'Credit/debit card services', estimated_time: 15 },
    { name: 'General Inquiry', description: 'General banking questions', estimated_time: 10 }
  ],
  healthcare: [
    { name: 'General Consultation', description: 'See a general practitioner', estimated_time: 30 },
    { name: 'Specialist Consultation', description: 'See a specialist doctor', estimated_time: 45 },
    { name: 'Lab Tests', description: 'Get lab work done', estimated_time: 20 },
    { name: 'Prescription Refill', description: 'Refill your prescription', estimated_time: 10 },
    { name: 'Vaccination', description: 'Get vaccinated', estimated_time: 15 }
  ],
  retail: [
    { name: 'Product Inquiry', description: 'Ask about products', estimated_time: 15 },
    { name: 'Returns & Exchanges', description: 'Return or exchange items', estimated_time: 20 },
    { name: 'Customer Support', description: 'Get assistance', estimated_time: 15 },
    { name: 'Warranty Service', description: 'Warranty claims', estimated_time: 25 },
    { name: 'Personal Shopping', description: 'Personal shopping assistance', estimated_time: 30 }
  ],
  government: [
    { name: 'Documentation', description: 'Document processing', estimated_time: 25 },
    { name: 'Permits & Licenses', description: 'Apply for permits or licenses', estimated_time: 30 },
    { name: 'Public Records', description: 'Access public records', estimated_time: 20 },
    { name: 'General Inquiry', description: 'General government services', estimated_time: 15 },
    { name: 'Citizen Services', description: 'Various citizen services', estimated_time: 20 }
  ],
  education: [
    { name: 'Admissions', description: 'Admission inquiries', estimated_time: 30 },
    { name: 'Counseling', description: 'Academic counseling', estimated_time: 40 },
    { name: 'Registration', description: 'Course registration', estimated_time: 20 },
    { name: 'Financial Aid', description: 'Financial aid assistance', estimated_time: 25 },
    { name: 'Student Services', description: 'General student services', estimated_time: 15 }
  ],
  corporate: [
    { name: 'HR Services', description: 'Human resources assistance', estimated_time: 25 },
    { name: 'IT Support', description: 'Technical support', estimated_time: 30 },
    { name: 'Facilities', description: 'Facility management', estimated_time: 20 },
    { name: 'Security', description: 'Security services', estimated_time: 15 },
    { name: 'General Services', description: 'General office services', estimated_time: 10 }
  ]
};

export const seedAllServices = async () => {
  try {
    console.log('Starting to seed services for all industries...');

    const industries = ['banking', 'healthcare', 'retail', 'government', 'education', 'corporate'];

    for (const industryId of industries) {
      // Check if services already exist for this industry
      const { data: existingServices } = await supabase
        .from('services')
        .select('id')
        .eq('industry_id', industryId);

      if (existingServices && existingServices.length > 0) {
        console.log(`Services already exist for ${industryId}, skipping...`);
        continue;
      }

      // Prepare services to insert
      const servicesToInsert = allServicesData[industryId as keyof typeof allServicesData].map(service => ({
        industry_id: industryId,
        name: service.name,
        description: service.description,
        estimated_time: service.estimated_time,
        is_active: true
      }));

      // Insert services
      const { data, error } = await supabase
        .from('services')
        .insert(servicesToInsert)
        .select();

      if (error) {
        console.error(`Error seeding services for ${industryId}:`, error);
      } else {
        console.log(`Successfully seeded ${data?.length || 0} services for ${industryId}`);
      }
    }

    console.log('Finished seeding all services');
    return { success: true };
  } catch (error) {
    console.error('Error in seedAllServices:', error);
    return { success: false, error };
  }
};

export const seedServicesForIndustry = async (industryId: string) => {
  try {
    // Check if services already exist
    const { data: existingServices, error: fetchError } = await supabase
      .from('services')
      .select('id')
      .eq('industry_id', industryId);

    // If Supabase fetch fails, return success (we'll use mock data)
    if (fetchError) {
      console.warn(`Supabase unavailable for ${industryId}, using mock data:`, fetchError);
      return { success: true, useMockData: true };
    }

    if (existingServices && existingServices.length > 0) {
      console.log(`Services already exist for ${industryId}`);
      return { success: true, data: existingServices };
    }

    const services = allServicesData[industryId as keyof typeof allServicesData];
    if (!services) {
      console.error(`No service data found for industry: ${industryId}`);
      return { success: false, error: 'Invalid industry ID' };
    }

    const servicesToInsert = services.map(service => ({
      industry_id: industryId,
      name: service.name,
      description: service.description,
      estimated_time: service.estimated_time,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('services')
      .insert(servicesToInsert)
      .select();

    if (error) {
      console.warn(`Error seeding services for ${industryId}, using mock data:`, error);
      return { success: true, useMockData: true };
    }

    console.log(`Successfully seeded ${data?.length || 0} services for ${industryId}`);
    return { success: true, data };
  } catch (error) {
    console.warn(`Error in seedServicesForIndustry for ${industryId}, using mock data:`, error);
    return { success: true, useMockData: true };
  }
};

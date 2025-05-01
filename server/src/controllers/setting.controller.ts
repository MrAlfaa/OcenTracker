import { Request, Response } from 'express';
import Setting from '../models/setting.model';

// Get all settings
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    // Optional category filter
    const category = req.query.category as string;
    
    // Build query
    const query: any = {};
    if (category) {
      query.category = category;
    }
    
    const settings = await Setting.find(query).sort({ category: 1, key: 1 });
    
    // Group settings by category for better organization
    const groupedSettings = settings.reduce((groups: any, setting) => {
      if (!groups[setting.category]) {
        groups[setting.category] = [];
      }
      groups[setting.category].push(setting);
      return groups;
    }, {});
    
    res.json(groupedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error while fetching settings' });
  }
};

// Update a setting
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: `Setting with key "${key}" not found` });
    }
    
    setting.value = value;
    await setting.save();
    
    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error while updating setting' });
  }
};

// Bulk update settings
export const bulkUpdateSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ message: 'Settings array is required' });
    }
    
    const updatePromises = settings.map(async (item) => {
      if (!item.key || item.value === undefined) {
        throw new Error(`Invalid setting item: key and value are required`);
      }
      
      return Setting.updateOne(
        { key: item.key },
        { $set: { value: item.value } }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Fetch updated settings
    const updatedSettings = await Setting.find({
      key: { $in: settings.map(item => item.key) }
    });
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({ 
      message: 'Server error while bulk updating settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a setting (admin only)
export const createSetting = async (req: Request, res: Response) => {
  try {
    const { key, value, type, category, description } = req.body;
    
    if (!key || value === undefined || !type || !category) {
      return res.status(400).json({ 
        message: 'Key, value, type, and category are required' 
      });
    }
    
    // Check if setting with this key already exists
    const existingSetting = await Setting.findOne({ key });
    if (existingSetting) {
      return res.status(400).json({ 
        message: `Setting with key "${key}" already exists` 
      });
    }
    
    const newSetting = new Setting({
      key,
      value,
      type,
      category,
      description: description || '',
    });
    
    await newSetting.save();
    
    res.status(201).json(newSetting);
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ message: 'Server error while creating setting' });
  }
};

// Initialize default settings if they don't exist
export const initializeDefaultSettings = async () => {
  try {
    console.log('Initializing default settings...');
    
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'OceanTracker',
        type: 'string',
        category: 'system',
        description: 'The name of the site',
      },
      {
        key: 'site_description',
        value: 'Ocean Shipping Tracking System',
        type: 'string',
        category: 'system',
        description: 'Short description of the site',
      },
      {
        key: 'contact_email',
        value: 'contact@oceantracker.com',
        type: 'string',
        category: 'system',
        description: 'Main contact email',
      },
      {
        key: 'timezone',
        value: 'UTC',
        type: 'string',
        category: 'system',
        description: 'Default timezone for the application',
      },
      {
        key: 'enable_email_notifications',
        value: true,
        type: 'boolean',
        category: 'notification',
        description: 'Enable/disable email notifications',
      },
      {
        key: 'email_from_address',
        value: 'no-reply@oceantracker.com',
        type: 'string',
        category: 'email',
        description: 'Email address used for sending notifications',
      },
      {
        key: 'sms_notifications_enabled',
        value: false,
        type: 'boolean',
        category: 'notification',
        description: 'Enable/disable SMS notifications',
      },
      {
        key: 'default_shipping_rate',
        value: 10.00,
        type: 'number',
        category: 'shipping',
        description: 'Default shipping rate in USD',
      },
      {
        key: 'delivery_days_estimate',
        value: 3,
        type: 'number',
        category: 'shipping',
        description: 'Estimated delivery time in days',
      },
      {
        key: 'payment_gateways',
        value: ['stripe', 'paypal'],
        type: 'array',
        category: 'payment',
        description: 'Enabled payment gateways',
      },
      {
        key: 'tracking_page_notice',
        value: 'For the most accurate information, please ensure your tracking number is entered correctly.',
        type: 'string',
        category: 'system',
        description: 'Notice displayed on the tracking page',
      },
      {
        key: 'maintenance_mode',
        value: false,
        type: 'boolean',
        category: 'system',
        description: 'Enable/disable maintenance mode',
      }
    ];
    
    for (const setting of defaultSettings) {
      const existingSetting = await Setting.findOne({ key: setting.key });
      if (!existingSetting) {
        await Setting.create(setting);
        console.log(`Created default setting: ${setting.key}`);
      }
    }
    
    console.log('Default settings initialization complete.');
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
};
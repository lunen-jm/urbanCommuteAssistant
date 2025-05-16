#!/usr/bin/env python
"""
Generate a comprehensive .env.example file from the settings class.
This makes it easier to keep documentation in sync with code.
"""

import inspect
import re
import os
import sys

# Add the app directory to the path so we can import from it
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def generate_env_example():
    """Generate a .env.example file based on the Settings class."""
    try:
        # Import the Settings class
        from app.core.config import Settings
        
        # Get the source code of the Settings class
        settings_source = inspect.getsource(Settings)
        
        # Extract field definitions using regex
        field_pattern = r'(\w+): [^=]+ = Field\(([^,]+),\s*description="([^"]+)"'
        fields = re.findall(field_pattern, settings_source)
        
        output_path = os.path.join(os.path.dirname(__file__), '.env.example')
        with open(output_path, 'w') as f:
            f.write("# Urban Commute Assistant Environment Variables\n")
            f.write("# Generated automatically from Settings class\n\n")
            
            current_section = None
            
            for var_name, default_val, description in fields:
                # Determine section based on naming conventions
                if var_name.startswith("DATABASE") or var_name.startswith("POSTGRES") or var_name.startswith("SQLALCHEMY"):
                    section = "Database Settings"
                elif var_name.startswith("REDIS"):
                    section = "Redis Settings"
                elif "API_KEY" in var_name:
                    section = "API Keys"
                elif var_name.startswith("KC_METRO"):
                    section = "Transit Data Settings"
                elif var_name.startswith("CORS"):
                    section = "CORS Settings"
                elif var_name.startswith("LOG"):
                    section = "Logging Settings"
                elif var_name.startswith("SECRET"):
                    section = "Security Settings"
                else:
                    section = "Other Settings"
                
                # Print section header if we're in a new section
                if section != current_section:
                    f.write(f"\n# {section}\n")
                    current_section = section
                
                # Clean up the default value
                if default_val == "..." or default_val.strip() == "...":
                    # This is a required field with no default
                    default = f"your_{var_name.lower()}_here"
                else:
                    # Try to extract the default value
                    default_match = re.search(r'"([^"]+)"', default_val)
                    if default_match:
                        default = default_match.group(1)
                    else:
                        default = default_val.strip()
                        # Handle boolean values
                        if default == "True":
                            default = "true"
                        elif default == "False":
                            default = "false"
                
                # Write the variable with description and default
                f.write(f"# {description}\n")
                f.write(f"{var_name}={default}\n\n")
            
        print(f"✅ Generated .env.example file at {output_path}")
        
    except ImportError as e:
        print(f"❌ Error importing Settings class: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error generating .env.example: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = generate_env_example()
    sys.exit(0 if success else 1)

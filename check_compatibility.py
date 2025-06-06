"""
Check compatibility of the current Python environment with the Urban Commute Assistant.

This script checks Python version and package compatibility to diagnose potential issues.
"""
import sys
import os
import importlib.util
import pkg_resources
import platform

def print_header(text):
    print("\n" + "=" * 60)
    print(f" {text} ".center(60, "="))
    print("=" * 60)

def print_result(name, result, details=None):
    if result:
        print(f"✅ {name}: {details if details else 'OK'}")
    else:
        print(f"❌ {name}: {details if details else 'Failed'}")

def check_package_version(package_name, min_version=None, max_version=None, exact_version=None):
    spec = importlib.util.find_spec(package_name)
    if spec is None:
        return False, f"Not installed"
    
    try:
        pkg = importlib.import_module(package_name)
        version = getattr(pkg, "__version__", "Unknown")
        
        if exact_version and version != exact_version:
            return False, f"Installed: {version}, Required: {exact_version}"
        
        if min_version and pkg_resources.parse_version(version) < pkg_resources.parse_version(min_version):
            return False, f"Installed: {version}, Minimum required: {min_version}"
            
        if max_version and pkg_resources.parse_version(version) > pkg_resources.parse_version(max_version):
            return False, f"Installed: {version}, Maximum supported: {max_version}"
            
        return True, f"Version {version}"
    except Exception as e:
        return False, f"Error checking version: {str(e)}"

def main():
    print_header("Urban Commute Assistant Compatibility Check")
    
    # System information
    print(f"System: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    
    # Python version check
    python_version = sys.version_info
    py_version_ok = python_version < (3, 12)
    print_result("Python version compatibility", 
                py_version_ok, 
                f"{python_version.major}.{python_version.minor}.{python_version.micro}" + 
                (" (recommended: 3.8-3.11)" if not py_version_ok else ""))
    
    print_header("Package Compatibility")
    
    # Check packages
    packages_to_check = [
        ("fastapi", None, "0.96.0", "0.95.0"),
        ("pydantic", None, "2.0.0", "1.10.7"),
        ("typing_extensions", None, "4.6.0", "4.5.0"),
        ("uvicorn", None, "0.22.0", "0.21.1"),
    ]
    
    all_ok = True
    for package, min_ver, max_ver, recommended_ver in packages_to_check:
        ok, details = check_package_version(package, min_ver, max_ver)
        print_result(package, ok, details)
        if not ok:
            all_ok = False
            print(f"   → Recommended version: {recommended_ver}")
    
    print_header("Recommendation")
    
    if python_version >= (3, 12):
        print("⚠️ You are using Python 3.12+ which has compatibility issues with some packages.")
        print("   Consider using Python 3.11 or try running with the patched script:")
        print("   cd backend")
        print("   python run_with_patching.py")
    elif not all_ok:
        print("⚠️ Some package versions are not compatible.")
        print("   Run the following command to install recommended versions:")
        print("   pip install fastapi==0.95.0 uvicorn==0.21.1 pydantic==1.10.7 typing-extensions==4.5.0")
    else:
        print("✅ Your environment looks compatible! You should be able to run the app without issues.")

if __name__ == "__main__":
    main()

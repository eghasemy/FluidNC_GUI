# FluidNC_GUI

A modern web-based configuration tool for [FluidNC](https://github.com/bdring/FluidNC), the advanced CNC firmware.

## ✨ Features

- **🧙‍♂️ Guided Wizard**: Step-by-step configuration for beginners - create a config in under 10 minutes!
- **🔧 Expert Editor**: Advanced tree-based editing for power users  
- **📌 Pin Mapper**: Visual pin conflict detection and validation
- **📁 Import/Export**: Support for YAML and JSON formats with legacy conversion
- **🔄 Legacy Support**: Seamlessly import and upgrade older FluidNC configurations
- **📋 Ready-to-use Recipes**: Complete configurations for common machine types

## 🚀 Quick Start

### Download Desktop App
Get the native desktop application for the best experience:
- **[Windows Installer (.msi)](https://github.com/eghasemy/FluidNC_GUI/releases/latest)**
- **[Linux Package (.deb/.rpm)](https://github.com/eghasemy/FluidNC_GUI/releases/latest)**

See our **[Release Process](docs/RELEASE.md)** for installation instructions.

### Online Version (Alternative)
Visit **[FluidNC GUI Documentation](https://eghasemy.github.io/FluidNC_GUI/)** for complete guides including:

- **[Getting Started](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/)** - Complete beginner's guide
- **[First Configuration](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/first-config)** - Create your first config in under 10 minutes
- **[Configuration Recipes](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/)** - Ready-to-use examples for common machines
- **[Troubleshooting](https://eghasemy.github.io/FluidNC_GUI/docs/troubleshooting/)** - Solutions to common issues

### 10-Minute Goal ⏱️

New users can create a complete FluidNC configuration in **under 10 minutes** following our guided documentation:

1. **[Install](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/installation)** - Access the web interface (no installation needed!)
2. **[First Config](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/first-config)** - Step-by-step guide with pin assignments
3. **[Upload & Test](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/first-config#step-8-upload-to-fluidnc-30-seconds)** - Get your machine running

## 📖 Documentation

### For Users
- **[Getting Started Guide](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/)** - Complete beginner tutorials
- **[Configuration Recipes](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/)** - Examples for different machine types:
  - [Basic 3-Axis Router](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/basic-3axis-router)
  - [Laser Engraver](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/laser-engraver)  
  - [4-Axis Mill](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/4axis-mill)
  - [Custom Board Setup](https://eghasemy.github.io/FluidNC_GUI/docs/recipes/custom-board)
- **[Features](https://eghasemy.github.io/FluidNC_GUI/docs/features/wizard)** - Detailed feature documentation
- **[Troubleshooting](https://eghasemy.github.io/FluidNC_GUI/docs/troubleshooting/)** - Common issues and solutions

### For Developers
- **[Expert Editor](https://eghasemy.github.io/FluidNC_GUI/docs/features/expert-editor)** - Advanced configuration editing
- **[Import/Export](https://eghasemy.github.io/FluidNC_GUI/docs/features/import-export)** - File format documentation
- **[Contributing](CONTRIBUTING.md)** - Development setup and guidelines

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Setup
```bash
git clone https://github.com/eghasemy/FluidNC_GUI.git
cd FluidNC_GUI
pnpm install
```

### Available Scripts

#### GUI Application
```bash
pnpm dev              # Start GUI development server
pnpm build            # Build all packages
pnpm lint             # Lint all packages
```

#### Documentation
```bash
pnpm dev:docs         # Start documentation development server
pnpm build:docs       # Build documentation for production
pnpm deploy:docs      # Deploy documentation to GitHub Pages
```

### Project Structure
```
FluidNC_GUI/
├── apps/
│   └── gui/          # Main GUI application
├── packages/
│   ├── core/         # Core FluidNC configuration schemas
│   └── presets/      # Configuration presets and examples
├── docs/             # Documentation website (Docusaurus)
├── examples/         # Example configurations
└── .github/          # GitHub Actions workflows
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** your changes thoroughly
4. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
5. **Push** to your branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

## 📋 Roadmap

- [ ] **Visual Pin Mapper** - Interactive board layout editor
- [ ] **3D Machine Preview** - Visualize your machine configuration
- [ ] **Configuration Validation** - Advanced error checking and warnings
- [ ] **Template System** - Save and share custom machine templates
- [ ] **Multi-language Support** - Internationalization for global users

## 🐛 Issues & Support

- **[GitHub Issues](https://github.com/eghasemy/FluidNC_GUI/issues)** - Bug reports and feature requests
- **[FluidNC Discussions](https://github.com/bdring/FluidNC/discussions)** - Community support and questions
- **[Documentation](https://eghasemy.github.io/FluidNC_GUI/)** - Complete user guides and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[FluidNC](https://github.com/bdring/FluidNC)** - The amazing CNC firmware this tool configures
- **[Docusaurus](https://docusaurus.io/)** - Powers our beautiful documentation
- **Community Contributors** - Everyone who has helped improve this project

---

**Ready to build your FluidNC configuration?** Start with our **[Getting Started Guide](https://eghasemy.github.io/FluidNC_GUI/docs/getting-started/)** and create your first config in under 10 minutes! 🚀

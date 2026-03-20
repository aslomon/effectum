# Stack Preset: Swift + iOS/macOS

> Native Apple platform apps with Swift, SwiftUI, and SwiftData.

## TECH_STACK

```
- Swift 6+ with strict concurrency checking
- SwiftUI for all UI (no UIKit unless wrapping legacy components)
- SwiftData for persistence (or CoreData for complex migration needs)
- Swift Testing framework (preferred) + XCTest for UI tests
- swift-format for code formatting
- SwiftLint for linting
- Swift Package Manager (SPM) for dependencies
- Xcode 16+ as primary IDE/build system
```

## ARCHITECTURE_PRINCIPLES

```
- MVVM: Views -> ViewModels -> Services/Repositories. No business logic in Views.
- PROTOCOL-ORIENTED: define protocols for services and repositories. Use concrete types only at composition root.
- @Observable MACRO: use @Observable (Swift 5.9+) instead of ObservableObject/Published for ViewModels.
- ACTOR ISOLATION: use actors for shared mutable state. Mark MainActor for all UI-related code.
- STRUCTURED CONCURRENCY: use async/await and TaskGroup. No completion handlers for new code.
- VALUE TYPES: prefer structs over classes. Use classes only for reference semantics or inheritance.
- DEPENDENCY INJECTION: pass dependencies through initializers or environment. No singletons except at app root.
- ERROR HANDLING: use typed throws (Swift 6) and Result type. Never force-unwrap (!) in production code.
- SWIFTDATA MODELS: use @Model macro for persistence. Define schemas with explicit versioning.
- PREVIEW-DRIVEN: every view must have a working #Preview with mock data.
```

## PROJECT_STRUCTURE

````
```
{ProjectName}/
  App/
    {ProjectName}App.swift          # @main entry point
    ContentView.swift               # Root navigation
    AppState.swift                  # Global app state
  Features/
    {Feature}/
      Views/
        {Feature}View.swift
        {Feature}DetailView.swift
      ViewModels/
        {Feature}ViewModel.swift
      Models/
        {Feature}Model.swift        # SwiftData @Model or domain model
  Core/
    Services/
      {Domain}Service.swift         # Business logic services
      NetworkService.swift          # API client
    Repositories/
      {Domain}Repository.swift      # Data access layer
    Extensions/
      View+Extensions.swift
      String+Extensions.swift
    Protocols/
      {Domain}ServiceProtocol.swift
    Utilities/
      Logger.swift
      Constants.swift
  Resources/
    Assets.xcassets
    Localizable.xcstrings
    Info.plist
  Previews/
    PreviewData.swift               # Shared mock data for previews
{ProjectName}Tests/
  Features/
    {Feature}/
      {Feature}ViewModelTests.swift
  Core/
    Services/
      {Domain}ServiceTests.swift
{ProjectName}UITests/
  {Feature}UITests.swift
Package.swift (if SPM-based)
```
````

## QUALITY_GATES

```
- Build: `swift build` or `xcodebuild build` — 0 errors, 0 warnings
- Tests: `swift test` or `xcodebuild test` — all pass
- Lint: `swiftlint lint --strict` — 0 violations
- Format: `swift-format lint -r Sources/` — 0 differences
- Concurrency: strict concurrency checking enabled — 0 warnings
- No Force Unwrap: 0 occurrences of `!` on optionals in production code
- No Print: 0 print() statements in production code (use Logger)
- Preview: all views have working #Preview blocks
- File Size: No file exceeds 300 lines
```

## FORMATTER

```
swift-format format -i
```

## FORMATTER_GLOB

```
swift
```

## PACKAGE_MANAGER

```
swift package (SPM)
```

## STACK_SPECIFIC_GUARDRAILS

```
- **SPM for dependencies**: Use Swift Package Manager exclusively. No CocoaPods or Carthage.
- **SwiftUI only**: All new UI must be SwiftUI. UIKit wrappers (UIViewRepresentable) only for components without SwiftUI equivalents.
- **@Observable over ObservableObject**: Use the @Observable macro (Swift 5.9+) for all new ViewModels. Do not use ObservableObject/Published.
- **Structured concurrency**: Use async/await and TaskGroup. No DispatchQueue or completion handlers in new code.
- **Actor isolation**: Use @MainActor for all ViewModel and View-related code. Use custom actors for shared mutable state.
- **No force unwrap**: Never use `!` to force-unwrap optionals in production code. Use guard-let, if-let, or nil-coalescing.
- **SwiftData versioning**: Always define schema versions when modifying @Model types. Use VersionedSchema and SchemaMigrationPlan.
- **Previews are mandatory**: Every View must have a #Preview block with representative mock data.
- **Localization from day one**: Use String(localized:) for all user-facing strings. Never hardcode display text.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **swift-format runs automatically**: The PostToolUse hook auto-formats .swift files. Don't run swift-format manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Package.resolved is protected**: Package.resolved cannot be written to directly. Use `swift package resolve` or `swift package update`.
```

# Plan-C
KLIRR hack - group Plan C

## Purpose

Plan-C is a full-stack web application developed as part of the KLIRR hackathon by group Plan C. The system serves as a scalable platform for managing and processing business-related data and operations, providing a user-friendly interface for interaction while leveraging robust backend services for data handling, API endpoints, and business logic execution. It aims to demonstrate efficient integration between modern web technologies and enterprise-grade .NET components, enabling rapid prototyping and deployment of web solutions.

It is intended to operate on a local network in a situation of crisis. The system will keep track of updates within different categories of issues. It will also help with an overview picture of what issues are currently active, which issues are completed, and when. Only management with a special USB device should be granted access to write new issues and interact with the system. The information will be open to view for anybody within the local network with a browser.

The data can later be exported to the non destructive PDF/A for archiving the events.

I orginalform är tanken att det ska finnas 3 roller i systemet - en som bara har läsrättigheter - en som bara har delvisa skrivrättigheter - och en som 'admin' med kompletta skrivrättigheter.
Detta kan hanteras via speciella USB-enheter som delas till de två skriv-berättiga rollerna. Detta gör att man även i kris inte behöver hålla reda på olika inloggningar till krissystemet, och att om AD/ordinarie inloggning inte fungerar så fungerar krissystemet.

Dock ser vi ett behov av att se exakt vem som tagit vilket beslut, och inte bara vilken roll. Detta kan ses som en utökning av systemet där man i första hand försöker att nå Entra/AD för inloggning, med fallback till enklare autentiseringar/aktoriseringar.

## Architecture Overview

The application follows a layered architecture separating concerns for maintainability and scalability:

- **Frontend**: Built with Next.js, a React-based framework for server-side rendering and static site generation. Handles user interactions, UI rendering, and client-side logic. Located in the `frontend/` directory.
- **Backend**: Comprises an ASP.NET Core Web API (`EmberWebApi`) for RESTful API endpoints, and a `Business` class library for encapsulating domain logic and services. The backend is targeted for .NET 10.0 and includes configuration for multiple runtime environments. Located in the `backend/` directory.
- ***Possible further development***
- There is a possibility to add another API for after-the-crisis data access. In that you could integrate with other systems or send a common format (such as .csv for Excel). Then all the desitions will be easier to follow up on with the regular environments.
- The data is (with this setup) stored in the same location as the system is. There is a possibility to store it in any other location depending on the needs. If it is stored in a cloud-synced folder it will be secured once the internet is back on track for example. It can of-course also be copied exery x hours to any or several backup drives if needed.

- **Infrastructure**: Utilizes NuGet packages for cross-platform compatibility, including runtime natives for various operating systems (e.g., Windows, Linux distributions). Build artifacts and dependencies are managed via MSBuild and NuGet.

### Key Components
- **EmberWebApi**: The main API project, exposing controllers for HTTP requests and integrating with the Business layer.
- **Business**: A shared library containing services, data models, and business rules.
- **Frontend App**: A Next.js application with TypeScript support, handling routing, components, and API consumption.

For development, ensure .NET 10.0 SDK and Node.js are installed. Build the backend with `dotnet build` and the frontend with `npm install && npm run build`.
# Stage 1: Build & Publish using .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["ReminderApp.Api/ReminderApp.Api.csproj", "ReminderApp.Api/"]
RUN dotnet restore "ReminderApp.Api/ReminderApp.Api.csproj"

# Copy full source and publish release
COPY . .
WORKDIR "/src/ReminderApp.Api"
RUN dotnet publish "ReminderApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal Runtime using .NET 10 ASP.NET
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

RUN mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ReminderApp.Api.dll"]
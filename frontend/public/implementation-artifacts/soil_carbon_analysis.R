# Soil carbon inferential analysis for the carbon-credit platform

data <- read.csv("soil_carbon_measurements.csv")

cat("Rows in dataset:", nrow(data), "\n")
cat("Seasons represented:", length(unique(data$season_name)), "\n\n")

cat("Correlation matrix:\n")
print(cor(data[, c("nitrogen", "moisture", "organic_carbon")]))
cat("\n")

cat("Regression: organic carbon ~ moisture\n")
moisture_model <- lm(organic_carbon ~ moisture, data = data)
print(summary(moisture_model))
cat("\n")

cat("Regression: organic carbon ~ nitrogen\n")
nitrogen_model <- lm(organic_carbon ~ nitrogen, data = data)
print(summary(nitrogen_model))
cat("\n")

baseline <- subset(data, season_name == "Rabi 2025 Baseline")$organic_carbon
comparison <- subset(data, season_name == "Monsoon 2026 Demo")$organic_carbon

cat("Hypothesis test: baseline vs comparison season organic carbon\n")
season_test <- t.test(comparison, baseline, alternative = "greater")
print(season_test)
cat("\n")

credit_summary <- aggregate(estimated_credit_tco2e ~ season_name, data = data, FUN = mean)
cat("Mean credit estimate by season:\n")
print(credit_summary)
cat("\n")

cat("Interpretation:\n")
cat("- Positive regression coefficients imply that better soil-health indicators move with higher organic carbon.\n")
cat("- The seasonal test checks whether the comparison season supports a stronger carbon-sequestration narrative.\n")
cat("- The mean credit estimate can be carried into the reporting layer with verifier review.\n")

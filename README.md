# GigShield

## Overview

GigShield is a weather-aware compensation platform designed for delivery agents. The system automatically identifies severe weather conditions in an agent's working location and generates eligible compensation requests.

To prevent fraudulent claims caused by GPS spoofing, GigShield incorporates location verification mechanisms before compensation is approved.

## Problem Statement

Many delivery organizations compensate delivery agents who work during severe weather conditions such as:

* Heavy rain
* Floods
* Extreme heat

However, organizations often incur losses because some users spoof their location and falsely claim compensation.

## Solution

GigShield automates the compensation process by:

* Detecting weather conditions in the agent's work location
* Generating compensation eligibility automatically
* Preventing fraudulent location-based claims
* Providing admin approval workflows
* Depositing approved payments directly to agent accounts

## Features

* Weather-based compensation
* Fraud prevention and location verification
* Admin approval workflow
* Direct payment processing
* Analytics and data visualization dashboard
* Real-time weather integration

## Tech Stack

### Frontend

* React

### Backend

* Spring Boot
* Spring Security
* JWT Authentication

### Database

* MySQL

### APIs

* OpenWeatherMap API

## Project Structure

backend/ - Spring Boot backend

frontend/ - React frontend

ml-service/ - Machine Learning services

database/ - Database scripts

## Team

Built during the Guidewire DEVTrails University Hackathon 2026.

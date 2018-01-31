# Doxie

Automatically pull images and pdfs from a Doxie scanner.

Steps:
Find or remove doxies
Poll /scans/recent.json for changes
If exists and no changes for x time
Get all scans, download them, email them, then delete them
If lost connection forget doxie

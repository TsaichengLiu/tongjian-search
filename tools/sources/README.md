# 字表數據來源

`app/data/variants.json` 由 `tools/build_variants.py` 從以下數據生成：

- `Unihan_Variants.txt`、`Unihan_CompatibilityVariants.txt`：Unicode Unihan Database 18.0（後者是從 `Unihan_IRGSources.txt` 中抽出的 `kCompatibilityVariant` 行）。© Unicode, Inc.，使用條款與許可見 <https://www.unicode.org/terms_of_use.html>（Unicode License v3）。
- `opencc/*.txt`：OpenCC 字典（STCharacters、TSCharacters、JPVariants、TWVariants、HKVariants），取自 opencc-python-reimplemented 0.1.7 所附數據，Apache License 2.0，全文見 `opencc/LICENSE.txt`。
- `supplement.txt`：本項目手工補充的舊字形對照（Unihan 未收、古籍常見者）。
